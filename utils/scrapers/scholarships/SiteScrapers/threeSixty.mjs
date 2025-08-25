import { chromium } from "playwright-core";

export async function scrapeThreeSixty(
  url,
  count,
  primaryPaginationSelector,
  secondaryPaginationSelector,
  extractor
) {
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
    let localPageSelector =
      currentPage === 0
        ? primaryPaginationSelector
        : secondaryPaginationSelector;
    // Scrape current page
    const pageResults = await extractor(page);
    results.push(...pageResults);

    if (results.length >= count) break;

    // Try clicking the "Next" button
    const nextButton = await page.$(localPageSelector);
    if (!nextButton) break; // no more pages

    await nextButton.click();
    await page.waitForLoadState("domcontentloaded");
    currentPage++;
  }

  await browser.close();
  return results.slice(0, count);
}
