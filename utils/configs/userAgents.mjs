const userAgents = [
  // Chrome on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",

  // Firefox on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",

  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",

  // Chrome on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",

  // Safari on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",

  // Firefox on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0",

  // Chrome on Linux
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",

  // Firefox on Linux
  "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0",
];

const randomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const browserOptions = {
  headless: true,
  userAgent: randomUserAgent(),
};

const browserArgs = [
  // Stealth options to avoid detection
  "--disable-blink-features=AutomationControlled",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-features=VizDisplayCompositor",
  "--disable-gpu",
  "--disable-ipc-flooding-protection",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-software-rasterizer",
  "--disable-sync",
  "--disable-web-security",
  "--disable-xss-auditor",
  "--no-first-run",
  "--no-sandbox",
  "--no-zygote",
  "--single-process",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-client-side-phishing-detection",
  "--disable-default-apps",
  "--disable-hang-monitor",
  "--disable-prompt-on-repost",
  "--disable-sync-preferences",
  "--disable-translate",
  "--metrics-recording-only",
  "--no-default-browser-check",
  "--safebrowsing-disable-auto-update",
  "--disable-component-update",
  "--disable-domain-reliability",
  "--disable-features=TranslateUI",
  "--disable-print-preview",
  "--disable-speech-api",
  "--hide-scrollbars",
  "--mute-audio",
  "--no-pings",
  "--no-report-upload",
  "--no-sandbox-and-elevated",
  "--no-service-autorun",
  "--password-store=basic",
  "--use-mock-keychain",
];

const browserContext = () => ({
  viewport: {
    width: Math.floor(Math.random() * 400) + 1200, // 1200-1600
    height: Math.floor(Math.random() * 400) + 800, // 800-1200
  },
  userAgent: randomUserAgent(),
  acceptLanguage: "en-US,en;q=0.9",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
});

export { userAgents, randomUserAgent, browserOptions, browserContext, browserArgs };
