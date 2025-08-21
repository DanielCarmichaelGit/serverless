/**
 * Scrape scholarships.
 * @param {number} count - The number of scholarships to scrape.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {string} deep - Boolean to scrape pages found in top level list
 */

import { scrapeScholarshipsPaginated } from "../scrapers/scholarships/index.mjs";
import { scrapeDeepPages } from "../scrapers/scholarships/deep.mjs";

export default async function scrapeScholarships(count, site, deep = false) {
  const list = await scrapeScholarshipsPaginated(count, site);
  console.log("list", list);
  let res = list;

  if (deep) {
    console.log("scraping deep pages");
    res = await scrapeDeepPages(site, list);
  }

  await browser.close();

  return res;
}
