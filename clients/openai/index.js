import OpenAI from "openai";

import { config as dotenvConfig } from "dotenv";

// Load .env only in dev
if (process.env.NODE_ENV !== "production") {
  dotenvConfig({ quiet: true });
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const MODEL = process.env.OPENAI_MODEL || "o3-mini";
