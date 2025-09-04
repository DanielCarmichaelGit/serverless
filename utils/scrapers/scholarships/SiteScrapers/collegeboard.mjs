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

  try {
    await page.waitForSelector(
      '[class^="SearchResultCardstyles__CardLink-scholarship-search-ui"]',
      { timeout: 10000 }
    );

    let results = [];
    let currentPage = 0;
    let keepGoing = true;
    let countOfEmptyPages = 0;

    while (results.length < count && keepGoing) {
      console.log("Current Collegeboard page", currentPage);

      const pageResults = await extractor(page);

      results.push(...pageResults);

      const nextButton = await page.$(primaryPaginationSelector);

      if (!nextButton || results.length >= count) {
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
    return results.slice(0, count);
  } catch (error) {
    console.error("Scraping failed:", error);
    return results.slice(0, count);
  } finally {
    await browser.close();
  }
}
