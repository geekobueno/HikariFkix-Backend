import axios from 'axios';
import * as cheerio from 'cheerio';
import { url } from "../utils/frenchUrl.js";
import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

async function extractEpisodesList(title) {
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(`https://${url}/${title}`);
    const $ = cheerio.load(response.data);

    // Find the specific div
    const targetDiv = $('div.flex.flex-wrap.overflow-y-hidden.justify-start.bg-slate-900.bg-opacity-70.rounded.mt-2.h-auto');

    if (targetDiv.length) {
      const scriptContent = targetDiv.find('script').html();

      // Parse the script to find panneauAnime function calls, excluding comments
      const animeList = [];
      const regex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\);/g;
      let match;
      while ((match = regex.exec(scriptContent)) !== null) {
        if (match[1] !== 'nom' && match[2] !== 'url') {
          animeList.push({
            name: match[1],
            url: `${match[2]}`,
            episodes: [], // Array to hold iframe srcs for each episode
          });
        }
      }

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

      
      for (let anime of animeList) {
        try {
                    // Navigate to the anime page with an increased timeout
          await page.goto(`https://${url}/${title}/${anime.url}`, {
            waitUntil: 'networkidle2',
            timeout: 60000, // Increase timeout to 60 seconds
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
    
            anime.episodes.push({ episode});
          }
    
        } catch (error) {
          console.error(`Error navigating to ${anime.url}:`, error.message);
        }
      }
    
       // Close the Puppeteer browser
       await browser.close();
      return animeList;
    } else {
      console.log('Target div not found.');
      return [];
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('404 Error: Page not found.');
      return [];
    } else {
      console.error('An error occurred:', error);
      return [];
    }
  }
}

export default extractEpisodesList;