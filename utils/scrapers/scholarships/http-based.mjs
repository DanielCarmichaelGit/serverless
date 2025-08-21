/**
 * HTTP-based scraper for much better performance than browser automation.
 * Uses axios and JSDOM for fast HTML parsing.
 */

import axios from "axios";
import { JSDOM } from "jsdom";

// Rotating user agents
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

// HTTP extractors that work with HTML strings instead of Playwright pages
const httpExtractors = {
  bold: (html) => {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const container = document.querySelector(
        "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div.flex.flex-col.px-0 > div.px-5 > div:nth-child(3)"
      );

      if (!container) {
        console.warn("Could not find main container in Bold.org page");
        return null;
      }

      // Extract data similar to the Playwright extractor but from HTML string
      const safeText = (selector) =>
        container.querySelector(selector)?.textContent.trim() || null;

      const elContainer = container.querySelector(".mb-10 .flex.items-center");

      let eligibility = null;
      if (elContainer) {
        const elKeysContainer = elContainer.querySelector(".mr-5.hidden");
        const elValuesContainer =
          elContainer.querySelector(".hidden:not(.mr-5)");

        if (elKeysContainer && elValuesContainer) {
          const elKeysElements = elKeysContainer.querySelectorAll(
            ".mb-3 div.text-text"
          );
          const elValuesElements = elValuesContainer.querySelectorAll(
            ".mb-3 div.text-text"
          );

          const elKeys = Array.from(elKeysElements).map((el) =>
            el?.textContent.trim()
          );
          const elValues = Array.from(elValuesElements).map((el) =>
            el?.textContent.trim()
          );

          // Create eligibility object
          eligibility = elKeys.map((key, index) => ({
            [key]: elValues[index],
          }));
        }
      }

      const description = Array.from(
        container.querySelectorAll("div.text-text.break-words.text-lg p")
      )
        .map((el) => el?.textContent.trim())
        .join("\n\n");

      const selectionCriteria = safeText(
        "div.mt-5.flex.flex-col.flex-wrap.pt-5 > div.text-text"
      );

      // Look for essay topic container
      const essayTopicContainer = document.querySelector(
        "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(3) > div"
      );

      let essayTopic = null;
      let wordCount = null;
      if (essayTopicContainer) {
        essayTopic = essayTopicContainer
          .querySelector(".mb-5 .text-text.mx-auto p span")
          ?.textContent.trim();
        wordCount = essayTopicContainer
          .querySelector(".text-center.text-sm.text-gray-600")
          ?.textContent.trim();
      }

      const winningApplication = document
        .querySelector(
          "#winning-application > div:nth-child(2) > div:nth-child(2)"
        )
        ?.textContent.trim();

      // Secondary content
      const secondaryContainer = document.querySelector(
        "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div.flex.flex-col.px-0 > div.hidden > div > div"
      );

      let winnersAnnounced = null;
      if (secondaryContainer) {
        winnersAnnounced = secondaryContainer
          .querySelector(
            "div.mt-7.flex.flex-wrap.justify-between > div:nth-child(2) > div.text-text.text-sm.font-semibold.leading-tight"
          )
          ?.textContent.trim();
      }

      const data = {
        eligibility,
        description,
        selectionCriteria,
        essayTopic,
        wordCount,
        winningApplication,
        winnersAnnounced,
      };

      // Only return if we have some meaningful data
      if (description || selectionCriteria || eligibility) {
        console.log("Successfully extracted data from Bold.org page");
        return data;
      }

      console.warn("No meaningful data extracted from Bold.org page");
      return null;
    } catch (error) {
      console.error("Error extracting data from Bold.org page:", error.message);
      return null;
    }
  },

  threeSixty: (html) => {
    // Similar implementation for 360 scholarships
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract data for 360 scholarships
      // This would need to be implemented based on the actual page structure

      return {
        description: "360 scholarships data (needs implementation)",
        eligibility: [],
      };
    } catch (error) {
      console.error("Error extracting data from 360 page:", error.message);
      return null;
    }
  },

  collegeboard: (html) => {
    // Similar implementation for collegeboard
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract data for collegeboard
      // This would need to be implemented based on the actual page structure

      return {
        description: "CollegeBoard data (needs implementation)",
        eligibility: [],
      };
    } catch (error) {
      console.error(
        "Error extracting data from CollegeBoard page:",
        error.message
      );
      return null;
    }
  },
};

// Rate limiting and concurrency control
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(500 + Math.random() * 1000);

export async function scrapeDeepPagesHTTP(site, list, options = {}) {
  const {
    concurrency = 10, // Much higher concurrency for HTTP requests
    maxRetries = 2,
    retryDelay = 2000,
    customHeaders = {},
  } = options;

  const extractor = httpExtractors[site];
  if (!extractor) {
    throw new Error(`No HTTP extractor found for site: ${site}`);
  }

  let filteredList = list.filter((scholarship) => scholarship.link);
  console.log(
    `Scraping ${filteredList.length} pages with HTTP (concurrency: ${concurrency})`
  );

  // Process in batches with controlled concurrency
  const results = [];
  for (let i = 0; i < filteredList.length; i += concurrency) {
    const batch = filteredList.slice(i, i + concurrency);

    const batchPromises = batch.map(async (scholarship) => {
      return await scrapeSinglePageHTTP(
        scholarship,
        extractor,
        maxRetries,
        retryDelay,
        customHeaders
      );
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(Boolean);
    results.push(...validResults);

    console.log(
      `Batch ${Math.floor(i / concurrency) + 1}: ${validResults.length}/${
        batch.length
      } successful`
    );

    // Small delay between batches
    if (i + concurrency < filteredList.length) {
      await randomDelay();
    }
  }

  console.log(
    `HTTP scraping completed: ${results.length}/${filteredList.length} successful`
  );
  return results;
}

async function scrapeSinglePageHTTP(
  scholarship,
  extractor,
  maxRetries,
  retryDelay,
  customHeaders
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userAgent =
        USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const response = await axios.get(scholarship.link, {
        headers: {
          "User-Agent": userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          ...customHeaders,
        },
        timeout: 15000,
        maxRedirects: 5,
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pageResults = extractor(response.data);

      if (pageResults) {
        return {
          ...scholarship,
          ...pageResults,
        };
      }

      return null;
    } catch (error) {
      lastError = error;
      console.warn(
        `Attempt ${attempt} failed for ${scholarship.link}:`,
        error.message
      );

      if (attempt < maxRetries) {
        await delay(retryDelay * attempt);
      }
    }
  }

  console.error(
    `Failed to scrape ${scholarship.link} after ${maxRetries} attempts:`,
    lastError
  );
  return null;
}
