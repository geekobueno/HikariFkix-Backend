// animeListExtractor.js
import axios from 'axios';
import * as cheerio from 'cheerio';

async function extractEpisodesList(link) {
    try {
        
        // Send a GET request to fetch the main page HTML content
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        
        // Extract the current page ID
        const currentPageId = $("input[name='current_page_id']").val();

        // Selector for episode list
        const episodeList = [];
        const episodeLinks = [];

        $('.listing-chapters_wrap .wp-manga-chapter').each((index, element) => {
            const episodeTitle = $(element).find('a').text().trim();
            const episodeLink = $(element).find('a').attr('href');
            
            episodeList.push({ title: episodeTitle, link: episodeLink });
            episodeLinks.push(episodeLink);
        });

        return { currentPageId, episodes: episodeList };

    } catch (error) {
        console.error("Error fetching episode list:", error);
        return []
    }
}

export default extractEpisodesList;