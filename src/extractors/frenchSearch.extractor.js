import axios from 'axios';
import * as cheerio from 'cheerio';

const extractSearch = async (query) => {
    try {
        // Send the POST request
        const response = await axios.post('https://anime-sama.fr/template-php/defaut/fetch.php', 
            new URLSearchParams({ query }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
                    'Referer': 'https://anime-sama.fr/',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept': '*/*',
                },
            });

        // Load the HTML response into cheerio for parsing
        const $ = cheerio.load(response.data);

        // Extract the anime titles, images, and links
        const results = [];
        $('a').each((index, element) => {
            const title = $(element).find('h3').text();
            const description = $(element).find('p').text();
            const link = $(element).attr('href');
            const imgSrc = $(element).find('img').attr('src');

            results.push({ title, description, link, imgSrc });
        });

        return results; // Return the extracted results
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error("Internal Server Error"); // Throw an error for the controller to catch
    }
};

export default extractSearch; // Export the function for use in the controller
