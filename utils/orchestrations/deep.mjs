/**
 * Scrape deep pages.
 * @param {string} site - The site to scrape (bold, etc.)
 * @param {Array} list - The list of scholarships to scrape.
 */

import _ from "lodash";
import { launchBrowser } from "../browser.mjs";
import { extractor as boldDeepExtractor } from "../extractors/scholarships/bold/deep.mjs";
import { extractor as threeSixtyDeepExtractor } from "../extractors/scholarships/360/deep.mjs";
import { extractor as collegeboardDeepExtractor } from "../extractors/scholarships/collegeboard/deep.mjs";
import { parkingLot } from "../../database/scholarships/utils.mjs";

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

export async function scrape(site) {
  const list = (await parkingLot.pull(site)).map(
    (scholarship) => scholarship.raw
  );

  // initialize new broswer loaded without css and images
  const { browser, context } = await launchBrowser();

  // load in specific extractor for given site
  const { extractor } = paramMap[site];

  // filter out scholarships that don't have a link
  let filteredList = list.filter((scholarship) => scholarship.link);
  const originalList = filteredList;

  if (paramMap[site].filterIfNot) {
    // filter out scholarships that don't match the filterIfNot function
    filteredList = filteredList.filter((scholarship) =>
      paramMap[site].filterIfNot(scholarship)
    );
  }

  const filteredOut = originalList.filter(
    (scholarship) => !filteredList.includes(scholarship)
  );

  // split the list into smaller, more respectful chunks
  const chunkedList = _.chunk(filteredList, 10);

  try {
    // now we have the split list, we need to scrape each chunk concurrently and wait for all to complete
    // Process chunks concurrently, but each chunk processes its scholarships in parallel
    const results = [];

    // Process chunks sequentially with respectful delays
    for (let i = 0; i < chunkedList.length; i++) {
      const chunk = chunkedList[i];

      // Process ALL scholarships in the chunk concurrently
      const chunkPromises = chunk.map(async (scholarship) => {
        const page = await context.newPage();
        try {
          await page.goto(scholarship.link, {
            waitUntil: "domcontentloaded",
            timeout: 10000,
          });
          const pageResults = await extractor(page);
          if (pageResults) {
            return { ...scholarship, ...pageResults };
          } else {
            return { ...scholarship }
          }
        } catch (error) {
          console.error("Error scraping deep page:", error);
          return { ...scholarship }
        } finally {
          await page.close();
        }
      });

      // Wait for all scholarships in this chunk to complete concurrently
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.filter(Boolean));

      // Delay between chunks (but not between individual scholarships)
      if (i < chunkedList.length - 1) {
        const delay = Math.floor(Math.random() * 3000) + 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    results.push(...filteredOut);

    const formatted = results.map((scholarship) => {
      return {
        link: scholarship.link,
        raw: {
          ...scholarship,
        },
        synced: false,
        deep_scraped: true,
        site,
      };
    });

    await parkingLot.upsert(formatted);
  } catch (error) {
    console.error("Error scraping deep pages:", error);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
