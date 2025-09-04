import { launchBrowser } from "../../../browser.mjs";
import { randomDelay } from "../../../configs/randomDelay.mjs";

export async function scrapeBold(
  url,
  count,
  primaryPaginationSelector,
  secondaryPaginationSelector,
  extractor
) {
  const { browser, page } = await launchBrowser();

  await page.goto(url, {
    waitUntil: "domcontentloaded", // or "load"
    timeout: 60000, // give it more time
  });

  await page.waitForSelector("main"); // anchor on a known container

  let results = [];
  let currentPage = 0;
  let keepGoing = true;
  let countOfEmptyPages = 0;

  while (results.length < count && keepGoing) {
    console.log("Current Bold page", currentPage);
    let localPageSelector =
      currentPage === 0
        ? primaryPaginationSelector
        : secondaryPaginationSelector;

    // Scrape current page
    const pageResults = await extractor(page);
    results.push(...pageResults);

    // Try clicking the "Next" button
    const nextButton = await page.$(localPageSelector);

    if (results.length >= count || !nextButton) {
      keepGoing = false;
      break;
    }

    if (pageResults.length === 0) {
      countOfEmptyPages++;
      if (countOfEmptyPages > 5) {
        keepGoing = false;
        break;
      }
      continue;
    }

    await randomDelay();

    await nextButton.click();
    await page.waitForLoadState("domcontentloaded");
    currentPage++;
  }

  await browser.close();
  return results.slice(0, count);
}
