import { createClient } from "@supabase/supabase-js";

import { config as dotenvConfig } from "dotenv";

// Load .env only in dev
if (process.env.NODE_ENV !== "production") {
  dotenvConfig({ quiet: true });
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);
