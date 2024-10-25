// animeListExtractor.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Extracts list of anime from the provided webpage
 * @param {string} link - The base URL to fetch anime list from
 * @returns {Promise<Array>} Array of anime objects with name and URL
 */
async function extractAnimeList(link) {
  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    
    const targetDiv = $('div.flex.flex-wrap.overflow-y-hidden.justify-start.bg-slate-900.bg-opacity-70.rounded.mt-2.h-auto');
    
    if (!targetDiv.length) {
      console.log('Target div not found.');
      return [];
    }
    
    const scriptContent = targetDiv.find('script').html();
    const animeList = [];
    const regex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\);/g;
    
    let match;
    while ((match = regex.exec(scriptContent)) !== null) {
      if (match[1] !== 'nom' && match[2] !== 'url') {
        animeList.push({
          name: match[1],
          url: `${match[2]}`,
        });
      }
    }
    
    return animeList;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('404 Error: Page not found.');
    } else {
      console.error('An error occurred:', error);
    }
    return [];
  }
}

export default extractAnimeList;