import { initBrowser } from "./streamUtils/browserInit.js";

export async function scrapeFilms(animeUrl, language) {
  let browser = null;
  let page = null;

  try {
    console.log("Initializing browser...");
    browser = await initBrowser();
    console.log("Browser initialized successfully");

    page = await browser.newPage();
    console.log("New page created");

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const url = `${animeUrl}/${language}`;
    console.log(`Navigating to: ${url}`);

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Checking page content...");

    // Wait for selector with timeout
    await page
      .waitForSelector("#selectEpisodes option", { timeout: 5000 })
      .catch(() => console.log("Selector timeout - continuing anyway"));

    // Extract film data
    const films = await page.evaluate(() => {
      const options = Array.from(
        document.querySelectorAll("#selectEpisodes option")
      );
      return options.map((element) => ({
        text: element.textContent?.trim() || "",
      }));
    });

    console.log(`Found ${films.length} films`);
    return films;
  } catch (error) {
    console.error("Film scraping error details:", {
      message: error.message,
      stack: error.stack,
      url: animeUrl,
      language,
    });
    return [];
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
    if (browser) {
      console.log("Closing browser");
      await browser.close().catch(console.error);
    }
  }
}
