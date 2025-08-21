/**
 * Configuration for scraping behavior and anti-blocking measures
 */

export const SCRAPING_CONFIG = {
  // Performance settings
  performance: {
    // Browser-based scraping
    browser: {
      concurrency: 3, // Number of concurrent browser pages
      maxRetries: 2, // Max retry attempts per page
      retryDelay: 5000, // Base delay between retries (ms)
      pageTimeout: 30000, // Page load timeout (ms)
      waitAfterLoad: 1000, // Wait time after page load (ms)
    },

    // HTTP-based scraping (much faster)
    http: {
      concurrency: 10, // Number of concurrent HTTP requests
      maxRetries: 2, // Max retry attempts per request
      retryDelay: 2000, // Base delay between retries (ms)
      requestTimeout: 15000, // Request timeout (ms)
    },
  },

  // Anti-blocking measures
  antiBlocking: {
    // Rate limiting
    rateLimit: {
      minDelay: 1000, // Minimum delay between requests (ms)
      maxDelay: 3000, // Maximum delay between requests (ms)
      batchDelay: 2000, // Delay between batches (ms)
    },

    // User agent rotation
    userAgents: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
    ],

    // Browser fingerprinting evasion
    browser: {
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    },

    // HTTP headers to look more legitimate
    headers: {
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
    },
  },

  // Site-specific settings
  sites: {
    bold: {
      maxConcurrent: 5, // Bold.org specific limits
      delayMultiplier: 1.5, // Be extra respectful to bold.org
      respectRobotsTxt: true,
    },
    threeSixty: {
      maxConcurrent: 8,
      delayMultiplier: 1.0,
      respectRobotsTxt: true,
    },
    collegeboard: {
      maxConcurrent: 6,
      delayMultiplier: 1.2,
      respectRobotsTxt: true,
    },
  },
};

// Helper function to get site-specific config
export function getSiteConfig(site) {
  const baseConfig = SCRAPING_CONFIG;
  const siteConfig = baseConfig.sites[site] || {};

  return {
    ...baseConfig,
    performance: {
      ...baseConfig.performance,
      browser: {
        ...baseConfig.performance.browser,
        concurrency: Math.min(
          baseConfig.performance.browser.concurrency,
          siteConfig.maxConcurrent || baseConfig.performance.browser.concurrency
        ),
      },
      http: {
        ...baseConfig.performance.http,
        concurrency: Math.min(
          baseConfig.performance.http.concurrency,
          siteConfig.maxConcurrent || baseConfig.performance.http.concurrency
        ),
      },
    },
    antiBlocking: {
      ...baseConfig.antiBlocking,
      rateLimit: {
        ...baseConfig.antiBlocking.rateLimit,
        minDelay: Math.floor(
          baseConfig.antiBlocking.rateLimit.minDelay *
            (siteConfig.delayMultiplier || 1)
        ),
        maxDelay: Math.floor(
          baseConfig.antiBlocking.rateLimit.maxDelay *
            (siteConfig.delayMultiplier || 1)
        ),
      },
    },
  };
}
