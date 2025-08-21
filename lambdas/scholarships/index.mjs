import { openai, MODEL } from "../_shared/openai-client.mjs";
import { zodTextFormat } from "openai/helpers/zod";
import { supabase } from "../_shared/supabase-client.mjs";

// openai resources
import { scholarshipSchema } from "../../schemas/scholarshipSchema.mjs";
import { system } from "../../systems/scholarships/normalizer.mjs";

/** Lambda handler */
export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    console.log(payload);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: e.message }),
    };
  }
};

const resp = await openai.responses.create({
  model: MODEL,
  input: [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Normalize to the JSON schema below.
  Rules:
  - Map any stated minimum GPA to gpa_min_bucket: none | 2_5 | 3_0 | 3_5 | 3_8 | 4_0.
  - If a deadline is parsed, also add its numeric month to filters.deadline_month.
  - Set source_name to "${sourceName ?? ""}" when appropriate.
  - Do NOT guess; if not present, use null or omit.
  
  Raw items:
  ${JSON.stringify(minimal, null, 2)}`,
        },
      ],
    },
  ],
  text: {
    format: {
      type: "json_schema",
      name: "ScholarshipSet",
      schema: scholarshipSchema,
      strict: true,
    },
  },
});

const text = resp.output_text ?? resp.output?.[0]?.content?.[0]?.text ?? "";
return JSON.parse(text);
