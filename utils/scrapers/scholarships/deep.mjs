/**
 * Scrape deep pages.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {Array} list - The list of scholarships to scrape.
 */

import { chromium } from "playwright-core";
import { extractor as boldDeepExtractor } from "../../extractors/scholarships/bold/deep.mjs";
import { extractor as threeSixtyDeepExtractor } from "../../extractors/scholarships/360/deep.mjs";
import { extractor as collegeboardDeepExtractor } from "../../extractors/scholarships/collegeboard/deep.mjs";

const paramMap = {
  bold: {
    extractor: boldDeepExtractor,
    filterIfNot: (scholarship) => {
      try {
        const url = new URL(scholarship.link);
        return url.hostname === "bold.org";
      } catch {
        return false;
      }
    },
  },
  threeSixty: {
    extractor: threeSixtyDeepExtractor,
  },
  collegeboard: {
    extractor: collegeboardDeepExtractor,
  },
};

export async function scrapeDeepPages(site, list) {
  const { extractor } = paramMap[site];
  let filteredList = list.filter((scholarship) => scholarship.link);
  console.log("singly filteredList", filteredList);
  filteredList = filteredList.filter((scholarship) =>
    paramMap[site].filterIfNot(scholarship)
  );
  console.log("doubly filteredList", filteredList);

  const results = [];

  for (const scholarship of filteredList) {
    console.log("scraping deep page", scholarship.link);
    // navigate to the page
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(scholarship.link);

    // extract the data
    const pageResults = await extractor(page);
    if (!pageResults) continue;

    results.push({
      ...scholarship,
      ...pageResults,
    });
  }

  return results;
}
