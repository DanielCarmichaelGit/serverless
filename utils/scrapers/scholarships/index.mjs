/**
 * New paginated scraper.
 * @param {number} count - Number of scholarships to collect
 * @param {string} site - The site to scrape (bold, etc.)
 */

import { chromium } from "playwright-core";
import { extractor as boldExtractor } from "../../extractors/scholarships/bold/index.mjs";
import { extractor as threeSixtyExtractor } from "../../extractors/scholarships/360/index.mjs";
import { extractor as collegeboardExtractor } from "../../extractors/scholarships/collegeboard/index.mjs";

const paramMap = {
  bold: {
    extractor: boldExtractor,
    url: "https://bold.org/scholarships/",
    primaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
    secondaryPaginationSelector: 'div[class*="Pagination_container"] a.button.button-primary.button-medium',
    paginationType: "standard"
  },
  threeSixty: {
    extractor: threeSixtyExtractor,
    url: "https://www.360scholarships.com/search/result/page:1",
    primaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
    secondaryPaginationSelector: 'a.button.button-medium.button-primary[class*="Pagination_button"]',
    paginationType: "standard"
  },
  collegeboard: {
    extractor: collegeboardExtractor,
    url: "https://bigfuture.collegeboard.org/scholarship-search",
    primaryPaginationSelector: 'button[data-testid="bf-scholarship-search-show-more"]',
    secondaryPaginationSelector: 'button[data-testid="bf-scholarship-search-show-more"]',
    paginationType: "showMore",
    resultsPerPage: 15
  },
};

export async function scrapeScholarshipsPaginated(count, site) {
  const { extractor, url, primaryPaginationSelector, secondaryPaginationSelector } = paramMap[site];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded", // or "load"
    timeout: 60000, // give it more time
  });
  await page.waitForSelector("main"); // anchor on a known container

  let results = [];
  let currentPage = 0;

  while (results.length < count) {
    let localPageSelector = currentPage === 0 ? primaryPaginationSelector : secondaryPaginationSelector;
    // Scrape current page
    const pageResults = await extractor(page);
    results.push(...pageResults);

    if (results.length >= count) break;

    // Try clicking the "Next" button
    const nextButton = await page.$(
      localPageSelector
    );
    if (!nextButton) break; // no more pages

    await nextButton.click();
    await page.waitForLoadState("domcontentloaded");
    currentPage++;
  }

  await browser.close();
  return results.slice(0, count);
}