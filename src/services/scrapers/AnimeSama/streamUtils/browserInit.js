import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";

export async function initBrowser() {
  try {
    if (process.env.VERCEL) {
      // Use puppeteer-core for Vercel
      const { default: puppeteerCore } = await import("puppeteer-core");
      const options = {
        args: [...chromium.args, ...config.chromium.args],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
        ignoreHTTPSErrors: true,
      };

      console.log(
        "Launching browser in Vercel with options:",
        JSON.stringify(options, null, 2)
      );
      return await puppeteerCore.launch(options);
    } else {
      // Local development configuration with explicit browser launch options
      console.log("Launching browser in local environment");
      return await puppeteer.launch({
        product: "chrome",
        headless: "new",
        ignoreHTTPSErrors: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-features=ChromeBrowserCloudManagement",
        ],
        // Increase timeout for browser launch
        timeout: 30000,
      });
    }
  } catch (error) {
    console.error("Browser launch error:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
