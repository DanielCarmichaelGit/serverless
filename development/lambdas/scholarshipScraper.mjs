import { scrape as topScrape } from "../../utils/orchestrations/index.mjs";
import { scrape as deepScrape } from "../../utils/orchestrations/deep.mjs";
import { Orchestrator } from "../../openai/scholarshipNormalizer.mjs";

// await Promise.all([
//   topScrape(500, "collegeboard"),
//   topScrape(500, "bold"),
// ])

// await Promise.all([
//   deepScrape("collegeboard"),
//   deepScrape("bold"),
// ])

await Promise.all([
  Orchestrator("collegeboard"),
  // Orchestrator("bold"),
])