import { scrape as topScrape } from "../../utils/orchestrations/index.mjs";
import { scrape as deepScrape } from "../../utils/orchestrations/deep.mjs";
import { Orchestrator } from "../../openai/scholarshipNormalizer.mjs";

// await Promise.all([
//   topScrape(3000, "collegeboard"),
//   topScrape(2000, "bold"),
// ])

await Promise.all([
  deepScrape("collegeboard"),
  deepScrape("bold"),
])

// await Promise.all([
//   Orchestrator("collegeboard"),
//   Orchestrator("bold"),
// ])