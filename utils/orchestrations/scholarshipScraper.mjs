/**
 * Scrape scholarships.
 * @param {number} count - The number of scholarships to scrape.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {string} deep - Boolean to scrape pages found in top level list
 * @param {Object} options - Additional options for scraping behavior
 */

import { scrapeScholarshipsPaginated } from "../scrapers/scholarships/index.mjs";
import { scrapeDeepPagesImproved } from "../scrapers/scholarships/improved.mjs";
import { scrapeDeepPagesHTTP } from "../scrapers/scholarships/http-based.mjs";
import { getSiteConfig } from "../scrapers/config.mjs";

export default async function scrapeScholarships(
  count,
  site,
  deep = false,
  options = {}
) {
  const siteConfig = getSiteConfig(site);

  // Merge user options with site-specific config
  const config = {
    ...siteConfig,
    ...options,
  };

  console.log(`Starting scholarship scraping for ${site} with config:`, config);

  const list = await scrapeScholarshipsPaginated(count, site);
  console.log(`Found ${list.length} scholarships at top level`);

  let res = list;

  if (deep) {
    console.log("Scraping deep pages...");

    // Choose between browser-based and HTTP-based scraping
    if (options.useHttpScraping) {
      console.log("Using HTTP-based scraping for better performance");
      res = await scrapeDeepPagesHTTP(site, list, config);
    } else {
      console.log("Using browser-based scraping for robustness");
      res = await scrapeDeepPagesImproved(site, list, config);
    }

    console.log(`Successfully scraped ${res.length} deep pages`);
  }

  return res;
}
