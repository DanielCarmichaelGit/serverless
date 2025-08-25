/**
 * New paginated scraper.
 * @param {number} count - Number of scholarships to collect
 * @param {string} site - The site to scrape (bold, etc.)
 */

import { scrapeBold } from "./SiteScrapers/bold.mjs";
import { scrapeThreeSixty } from "./SiteScrapers/threeSixty.mjs";
import { scrapeCollegeboard } from "./SiteScrapers/collegeboard.mjs";
import { extractor as boldExtractor } from "../../extractors/scholarships/bold/index.mjs";
import { extractor as threeSixtyExtractor } from "../../extractors/scholarships/360/index.mjs";
import { extractor as collegeboardExtractor } from "../../extractors/scholarships/collegeboard/index.mjs";

const paramMap = {
  bold: {
    extractor: boldExtractor,
    url: "https://bold.org/scholarships/",
    primaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
    secondaryPaginationSelector: 'div[class*="Pagination_container"] a.button.button-primary.button-medium',
  },
  threeSixty: {
    extractor: threeSixtyExtractor,
    url: "https://www.360scholarships.com/search/result/page:1",
    primaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
    secondaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
  },
  collegeboard: {
    extractor: collegeboardExtractor,
    url: "https://bigfuture.collegeboard.org/scholarship-search",
    primaryPaginationSelector: 'button[data-testid="bf-scholarship-search-show-more"]',
    secondaryPaginationSelector: 'button[data-testid="bf-scholarship-search-show-more"]',
  },
};

export async function scrapeScholarshipsPaginated(count, site) {
  const { extractor, url, primaryPaginationSelector, secondaryPaginationSelector } = paramMap[site];
  
  switch (site) {
    case "bold":
      console.log("Scraping Bold for", count, "scholarships");
      return scrapeBold(url, count, primaryPaginationSelector, secondaryPaginationSelector, extractor);
    case "threeSixty":
      console.log("Scraping ThreeSixty for", count, "scholarships");
      return scrapeThreeSixty(url, count, primaryPaginationSelector, secondaryPaginationSelector, extractor);
    case "collegeboard":
      console.log("Scraping CollegeBoard for", count, "scholarships");
      return scrapeCollegeboard(url, count, primaryPaginationSelector, secondaryPaginationSelector, extractor);
  }
}