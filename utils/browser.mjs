import { chromium } from "playwright-core";
import { browserOptions, browserContext, browserArgs } from "./configs/userAgents.mjs";

export async function launchBrowser() {
  const browser = await chromium.launch({ ...browserOptions, args: browserArgs });
  const context = await browser.newContext(browserContext());
  const page = await context.newPage();

  return { browser, context, page };
}