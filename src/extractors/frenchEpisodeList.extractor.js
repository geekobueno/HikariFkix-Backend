import axios from 'axios';
import * as cheerio from 'cheerio';

async function extractEpisodesList(link) {
  try {
    // Fetch the HTML from the URL
    const response = await axios.get(link);
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

      for (let anime of animeList) {
        const query = `${link}/${anime.url}/episodes.js?filever=2548`
        const response = await axios.get(query);

       // The response is in text format, so we need to extract the arrays
      const textData = response.data;

      // Regular expressions to extract eps1, eps2, and epsAS arrays from text
      const eps1Match = textData.match(/var\s+eps1\s*=\s*(\[.*?\]);/s);
      const eps2Match = textData.match(/var\s+eps2\s*=\s*(\[.*?\]);/s);
      const epsASMatch = textData.match(/var\s+epsAS\s*=\s*(\[.*?\]);/s);

      // Use eval or JSON.parse if safe (assuming the content is trusted)
      const eps1 = eps1Match ? eval(eps1Match[1]) : [];
      const eps2 = eps2Match ? eval(eps2Match[1]) : [];
      const epsAS = epsASMatch ? eval(epsASMatch[1]) : [];

      // Map each array of sources (eps1, eps2, epsAS) to the same episode
      for (let i = 0; i < eps1.length; i++) {
        anime.episodes.push({
          episode: i + 1,
          sources: [
            { source: '1', url: eps1[i] || null },
            { source: '2', url: eps2[i] || null },
            { source: '3', url: epsAS[i] || null }
          ].filter(source => source.url !== null), // Filter out null URLs
        });
      }

      }
      return animeList

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