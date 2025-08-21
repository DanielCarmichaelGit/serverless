import scrapeScholarships from "../utils/orchestrations/scholarshipScraper.mjs";

// Test different scraping approaches
async function testScrapingApproaches() {
  const testCount = 10; // Small number for testing
  const site = "bold";

  console.log("=== Testing Improved Scraping Approaches ===\n");

  // Test 1: Browser-based scraping with improved performance
  console.log("1. Testing improved browser-based scraping...");
  const startTime1 = Date.now();

  try {
    const result1 = await scrapeScholarships(testCount, site, true, {
      useHttpScraping: false,
      concurrency: 3,
      maxRetries: 1,
    });

    const time1 = Date.now() - startTime1;
    console.log(
      `✅ Browser-based: ${result1.length} results in ${time1}ms (${(
        time1 / 1000
      ).toFixed(2)}s)\n`
    );
  } catch (error) {
    console.error(`❌ Browser-based failed:`, error.message);
  }

  // Test 2: HTTP-based scraping (much faster)
  console.log("2. Testing HTTP-based scraping...");
  const startTime2 = Date.now();

  try {
    const result2 = await scrapeScholarships(testCount, site, true, {
      useHttpScraping: true,
      concurrency: 5,
      maxRetries: 1,
    });

    const time2 = Date.now() - startTime2;
    console.log(
      `✅ HTTP-based: ${result2.length} results in ${time2}ms (${(
        time2 / 1000
      ).toFixed(2)}s)\n`
    );
  } catch (error) {
    console.error(`❌ HTTP-based failed:`, error.message);
  }

  // Test 3: Top-level only (baseline)
  console.log("3. Testing top-level scraping only...");
  const startTime3 = Date.now();

  try {
    const result3 = await scrapeScholarships(testCount, site, false);

    const time3 = Date.now() - startTime3;
    console.log(
      `✅ Top-level only: ${result3.length} results in ${time3}ms (${(
        time3 / 1000
      ).toFixed(2)}s)\n`
    );
  } catch (error) {
    console.error(`❌ Top-level failed:`, error.message);
  }
}

// Run the test
testScrapingApproaches().catch(console.error);
