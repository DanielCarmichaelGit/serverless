/**
 * Scrape scholarships.
 * @param {number} count - The number of scholarships to scrape.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {string} deep - Boolean to scrape pages found in top level list
 */

import { scrapeScholarshipsPaginated } from "../scrapers/scholarships/index.mjs";
// import { scrapeDeepPages } from "../scrapers/scholarships/deep.mjs";
import { parkingLot } from "../../database/scholarships/utils.mjs";

export async function scrape(count, site, deep = false) {
  const list = await scrapeScholarshipsPaginated(count, site);

  const formatted = list.map((item) => {
    return {
      link: item.link,
      raw: {
        ...item
      },
      synced: false,
      deep_scraped: false,
      site
    };
  });

  await parkingLot.upsert(formatted);
}
