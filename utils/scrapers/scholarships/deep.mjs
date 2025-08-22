/**
 * Scrape deep pages.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {Array} list - The list of scholarships to scrape.
 */

import { chromium } from "playwright-core";
import _ from "lodash";
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

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
];

const browserContext = (userAgent) => ({
  viewport: {
    width: Math.floor(Math.random() * 400) + 1200, // 1200-1600
    height: Math.floor(Math.random() * 400) + 800, // 800-1200
  },
  userAgent: userAgent,
  acceptLanguage: "en-US,en;q=0.9",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
});

export async function scrapeDeepPages(site, list) {
  // initialize new broswer loaded without css and images
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });
  // create a new context to use for the browser
  const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const context = await browser.newContext(browserContext(randomAgent));

  // load in specific extractor for given site
  const { extractor } = paramMap[site];

  console.log("unfiltered list", list.length);

  console.log(
    "reverse filtered list",
    list.filter((scholarship) => !scholarship.link).length
  );

  // filter out scholarships that don't have a link
  let filteredList = list.filter((scholarship) => scholarship.link);

  console.log("singly filtered list", filteredList.length);

  // filter out scholarships that don't match the filterIfNot function
  filteredList = filteredList.filter((scholarship) =>
    paramMap[site].filterIfNot(scholarship)
  );

  console.log("doubly filtered list", filteredList.length);

  // split the list into smaller, more respectful chunks
  const chunkedList = _.chunk(filteredList, 5);

  try {
    // now we have the split list, we need to scrape each chunk concurrently and wait for all to complete
    // Process chunks concurrently, but each chunk processes its scholarships in parallel
    const results = [];

    // Process chunks sequentially with respectful delays
    for (let i = 0; i < chunkedList.length; i++) {
      const chunk = chunkedList[i];
      console.log(
        `Processing chunk ${i + 1}/${chunkedList.length} with ${
          chunk.length
        } scholarships`
      );

      // Process scholarships in chunk with small random delays to look more human
      const chunkResults = [];
      for (const scholarship of chunk) {
        const page = await context.newPage();
        try {
          await page.goto(scholarship.link, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
          const pageResults = await extractor(page);
          if (pageResults) {
            chunkResults.push({ ...scholarship, ...pageResults });
          }
        } finally {
          await page.close();
        }

        // Small random delay between pages in same chunk (0.5-1.5 seconds)
        const pageDelay = Math.floor(Math.random() * 1000) + 500;
        await new Promise((resolve) => setTimeout(resolve, pageDelay));
      }

      results.push(...chunkResults);

      // Respectful delay between chunks (2-5 seconds)
      if (i < chunkedList.length - 1) {
        const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
        console.log(`Waiting ${delay}ms before next chunk...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results.flat();
  } catch (error) {
    console.error("Error scraping deep pages:", error);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
