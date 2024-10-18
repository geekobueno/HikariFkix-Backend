import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

async function extractVO(animeList){

    // Launch Puppeteer using chrome-aws-lambda for Vercel and puppeteer for local
    const executablePath = process.env.AWS_LAMBDA_FUNCTION_VERSION
    ? await chromium.executablePath // Use chrome-aws-lambda on Vercel
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // Use local Chrome/Chromium executable for development

  const browser = await puppeteer.launch({
    args: chromium.args,
    args: [ '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process' ],
    executablePath: executablePath,
    headless: true, // Ensure headless mode
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();

  // Loop through each anime and navigate to its page to find episodes and iframe src
  for (let anime of animeList) {
    try {
      // Navigate to the anime page with an increased timeout
      await page.goto(`https://${url}/${title}/${anime.url}`, {
        waitUntil: 'networkidle2',
        timeout: 100000, // Increase timeout to 60 seconds
      });

      // Wait for the select tag with id selectEpisodes to appear
      await page.waitForSelector('#selectEpisodes');

      // Extract the episode options from the select dropdown
      const episodes = await page.$$eval('#selectEpisodes option', options =>
        options.map(option => option.textContent.trim())
      );

      // Loop through each episode and get the iframe src
      for (const episode of episodes) {
        // Select the episode
        await page.select('#selectEpisodes', episode);

        // Wait for the iframe to update after selecting the episode
        await page.waitForSelector('#playerDF[src]'); // Wait for the iframe src to appear

        // Extract the src of the updated iframe
        const iframeSrc = await page.$eval('#playerDF', iframe => iframe.src);

        // Store the iframe src in the anime object
        anime.episodes.push({ episode, VOsrc: iframeSrc });
      }

    } catch (error) {
      console.error(`Error navigating to ${anime.url}:`, error.message);
    }
  }

   // Close the Puppeteer browser
   await browser.close();
 
   return animeList;

}

async function extractVF(animeList){

    // Launch Puppeteer using chrome-aws-lambda for Vercel and puppeteer for local
    const executablePath = process.env.AWS_LAMBDA_FUNCTION_VERSION
    ? await chromium.executablePath // Use chrome-aws-lambda on Vercel
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // Use local Chrome/Chromium executable for development

  const browser = await puppeteer.launch({
    args: chromium.args,
    args: [ '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process' ],
    executablePath: executablePath,
    headless: true, // Ensure headless mode
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();

  // Loop through each anime and navigate to its page to find episodes and iframe src
  for (let anime of animeList) {
    try {
        url = anime.url.replace('/vostfr', '/vf');
      // Navigate to the anime page with an increased timeout
      await page.goto(`https://${url}/${title}/${url}`, {
        waitUntil: 'networkidle2',
        timeout: 100000, // Increase timeout to 60 seconds
      });

      // Wait for the select tag with id selectEpisodes to appear
      await page.waitForSelector('#selectEpisodes');

      // Extract the episode options from the select dropdown
      const episodes = await page.$$eval('#selectEpisodes option', options =>
        options.map(option => option.textContent.trim())
      );

      // Loop through each episode and get the iframe src
      for (const episode of episodes) {
        // Select the episode
        await page.select('#selectEpisodes', episode);

        // Wait for the iframe to update after selecting the episode
        await page.waitForSelector('#playerDF[src]'); // Wait for the iframe src to appear

        // Extract the src of the updated iframe
        const iframeSrc = await page.$eval('#playerDF', iframe => iframe.src);

        // Store the iframe src in the anime object
        anime.episodes.push({ episode, VFsrc: iframeSrc });
      }

    } catch (error) {
      console.error(`Error navigating to ${anime.url}:`, error.message);
    }
  }

   // Close the Puppeteer browser
   await browser.close();
 
   return animeList;

}

export default {extractVO ,extractVF};

