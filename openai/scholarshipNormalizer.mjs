import { openai, MODEL } from "../clients/openai/index.js";
import { system } from "../utils/prompts/scholarships.mjs";
import { zodTextFormat } from "openai/helpers/zod";
import { parkingLot } from "../database/scholarships/utils.mjs";
import { scholarshipArrayAsObject } from "../schemas/scholarshipSchema.mjs";
import { encoding_for_model } from "tiktoken";

const tokenizer = encoding_for_model("gpt-5-mini");
import _ from "lodash";

const batchSize = 2;

const normalize = async (scholarships) => {
  const response = await openai.responses.parse({
    model: MODEL,
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: `${JSON.stringify(scholarships)}`,
      },
    ],
    text: {
      format: zodTextFormat(scholarshipArrayAsObject, "scholarship_formatter"),
    },
  });

  const parsed = response.output_parsed;

  return parsed;
};

export const Orchestrator = async (site) => {
  // pull all scholarships from the parking lot
  const list = await parkingLot.pull(site);

  // chunk the list into smaller batches
  const chunks = _.chunk(list, 20);
  const mergedList = [];

  // Process chunks in batches of 10 concurrently
  const processChunkBatch = async (chunkBatch) => {
    const batchResults = await Promise.all(
      chunkBatch.map(async (chunk) => {
        const normalized = await normalize(chunk);

        const chunkMergedList = [];
        for (const scholarship of normalized.scholarships) {
          const current = chunk.find((s) => s.raw.link === scholarship.link);

          if (!current) continue;

          // TODO: Scrape the scholarship raw object clean so it complies with db schema
          // delete current.raw.link;

          chunkMergedList.push({
            ...scholarship,
            ...current,
          });
        }

        return chunkMergedList;
      })
    );

    return batchResults.flat();
  };

  // Process all chunks in batches of 10
  for (let i = 0; i < 3; i += batchSize) {
    const chunkBatch = chunks.slice(i, i + batchSize);
    const batchResults = await processChunkBatch(chunkBatch);
    mergedList.push(...batchResults);
  }

  console.log("Merged List:", mergedList);

  await parkingLot.sync(mergedList);
};
