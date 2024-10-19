import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import { url } from "../utils/frenchUrl.js";

async function launchBrowser() {
  const executablePath = process.env.AWS_LAMBDA_FUNCTION_VERSION
    ? await chromium.executablePath
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  return puppeteer.launch({
    args: chromium.args,
    executablePath: executablePath,
    headless: true,
    defaultViewport: chromium.defaultViewport,
  });
}

async function extractVO(showUrl, episodeNumber) {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(`https://${url}/${showUrl}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.waitForSelector('#selectEpisodes');

    const episodeOption = `Episode ${episodeNumber}`;
    await page.select('#selectEpisodes', episodeOption);

    await page.waitForSelector('#playerDF[src]');

    const VO = await page.$eval('#playerDF', iframe => iframe.src);

    await browser.close();
    return VO;
  } catch (error) {
    console.error(`Error getting VO streaming URL for ${showUrl}, episode ${episodeNumber}:`, error.message);
    await browser.close();
    throw error;
  }

}

async function extractVF(showUrl, episodeNumber) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const url = showUrl.replace('/vostfr', '/vf');

  try {
    await page.goto(`https://${url}/${url}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await page.waitForSelector('#selectEpisodes');

    const episodeOption = `Episode ${episodeNumber}`;
    await page.select('#selectEpisodes', episodeOption);

    await page.waitForSelector('#playerDF[src]');

    const VF = await page.$eval('#playerDF', iframe => iframe.src);

    await browser.close();
    return VF;
  } catch (error) {
    console.error(`Error getting VF streaming URL for ${showUrl}, episode ${episodeNumber}:`, error.message);
    await browser.close();
    throw error;
  }
}

export default { extractVO, extractVF };