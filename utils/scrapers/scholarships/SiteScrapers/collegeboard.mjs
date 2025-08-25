import { launchBrowser } from "../../../browser.mjs";
import { randomDelay } from "../../../../utils/configs/randomDelay.mjs";

export async function scrapeCollegeboard(
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

  await page.waitForSelector(
    '[class^="SearchResultCardstyles__CardLink-scholarship-search-ui"]',
    { timeout: 10000 }
  );

  let results = [];
  let currentPage = 0;
  let keepGoing = true;

  while (results.length < count && keepGoing) {
    let skip = results.length || 0;

    const pageResults = await extractor(page, skip);

    results.push(...pageResults);

    const nextButton = await page.$(primaryPaginationSelector);
    
    if (!nextButton || results.length >= count) {
      keepGoing = false;
      break;
    }

    await randomDelay();

    await page.evaluate((primaryPaginationSelector) => {
      const button = document.querySelector(primaryPaginationSelector);
      button.click();
    }, primaryPaginationSelector);

    await page.waitForSelector(
      '[class^="SearchResultCardstyles__CardLink-scholarship-search-ui"]',
      { timeout: 10000 }
    );
    currentPage++;
  }

  await browser.close();
  return results.slice(0, count);
}
