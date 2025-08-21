/**
 * Improved scraping implementation with better performance and anti-blocking measures.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {Array} list - The list of scholarships to scrape.
 * @param {Object} options - Configuration options
 */

import { chromium } from "playwright-core";
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

// User agent rotation to avoid detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
];

// Rate limiting utility
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Random delay between requests (1-3 seconds)
const randomDelay = () => delay(1000 + Math.random() * 2000);

// Batch processing with concurrency control
async function processBatch(items, processor, concurrency = 3) {
  const results = [];
  const batches = [];

  // Split items into batches
  for (let i = 0; i < items.length; i += concurrency) {
    batches.push(items.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(processor);
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches to be respectful
    if (batches.indexOf(batch) < batches.length - 1) {
      await randomDelay();
    }
  }

  return results;
}

export async function scrapeDeepPagesImproved(site, list, options = {}) {
  const {
    concurrency = 3,
    maxRetries = 2,
    retryDelay = 5000,
    respectRobotsTxt = true,
    useProxies = false,
    proxyList = [],
    customHeaders = {},
  } = options;

  const { extractor } = paramMap[site];
  let filteredList = list.filter((scholarship) => scholarship.link);

  if (paramMap[site].filterIfNot) {
    filteredList = filteredList.filter((scholarship) =>
      paramMap[site].filterIfNot(scholarship)
    );
  }

  console.log(
    `Scraping ${filteredList.length} deep pages with concurrency ${concurrency}`
  );

  // Single browser instance for all requests
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
    ],
  });

  try {
    // Process scholarships in batches with concurrency control
    const results = await processBatch(
      filteredList,
      async (scholarship) => {
        return await scrapeSinglePageWithRetry(
          browser,
          scholarship,
          extractor,
          maxRetries,
          retryDelay,
          customHeaders
        );
      },
      concurrency
    );

    return results.filter(Boolean); // Remove failed scrapes
  } finally {
    await browser.close();
  }
}

async function scrapeSinglePageWithRetry(
  browser,
  scholarship,
  extractor,
  maxRetries,
  retryDelay,
  customHeaders
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const page = await browser.newPage();

      try {
        // Set random user agent - use the correct Playwright method
        const userAgent =
          USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // Try different methods for setting user agent
        try {
          if (typeof page.setUserAgent === "function") {
            await page.setUserAgent(userAgent);
          } else if (typeof page.setExtraHTTPHeaders === "function") {
            await page.setExtraHTTPHeaders({
              "User-Agent": userAgent,
              ...customHeaders,
            });
          }
        } catch (uaError) {
          console.warn("Could not set user agent:", uaError.message);
        }

        // Set additional headers to look more like a real browser
        try {
          if (typeof page.setExtraHTTPHeaders === "function") {
            await page.setExtraHTTPHeaders({
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Accept-Encoding": "gzip, deflate, br",
              DNT: "1",
              Connection: "keep-alive",
              "Upgrade-Insecure-Requests": "1",
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "none",
              "Cache-Control": "max-age=0",
              ...customHeaders,
            });
          }
        } catch (headerError) {
          console.warn("Could not set extra headers:", headerError.message);
        }

        // Set viewport to look more realistic
        try {
          if (typeof page.setViewportSize === "function") {
            await page.setViewportSize({ width: 1920, height: 1080 });
          }
        } catch (viewportError) {
          console.warn("Could not set viewport:", viewportError.message);
        }

        // Navigate with timeout and wait for content
        await page.goto(scholarship.link, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Wait a bit for dynamic content to load
        await delay(1000 + Math.random() * 2000);

        // Extract data
        const pageResults = await extractor(page);

        if (pageResults) {
          return {
            ...scholarship,
            ...pageResults,
          };
        }

        return null;
      } finally {
        await page.close();
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `Attempt ${attempt} failed for ${scholarship.link}:`,
        error.message
      );

      if (attempt < maxRetries) {
        await delay(retryDelay * attempt); // Exponential backoff
      }
    }
  }

  console.error(
    `Failed to scrape ${scholarship.link} after ${maxRetries} attempts:`,
    lastError
  );
  return null;
}
