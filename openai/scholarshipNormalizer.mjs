import { openai, MODEL } from "../clients/openai/index.js";
import { system } from "../utils/prompts/scholarships.mjs";
import { zodTextFormat } from "openai/helpers/zod";
import { parkingLot } from "../database/scholarships/utils.mjs";
import { scholarshipArrayAsObject } from "../schemas/scholarshipSchema.mjs";

import _ from "lodash";

const normalize = async (scholarships) => {
  const response = await openai.responses.parse({
    model: MODEL,
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: `${JSON.stringify(scholarships, null, 2)}`,
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
  const list = await parkingLot.pull(site);
  const chunks = _.chunk(list, 10);

  for (const chunk of chunks) {
    const normalized = await normalize(chunk);
    await parkingLot.sync(normalized.scholarships);
  }
};
