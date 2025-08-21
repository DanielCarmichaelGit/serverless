import scrapeScholarships from "../../utils/orchestrations/scholarshipScraper.mjs";

const res = await scrapeScholarships(100, "bold", true);

console.log(res);