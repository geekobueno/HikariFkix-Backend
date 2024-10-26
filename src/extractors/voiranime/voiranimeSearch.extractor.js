import axios from 'axios';
import * as cheerio from 'cheerio';

export const extractSearchVO = async (query) => {
    try {
        const response = await axios.post('https://v5.voiranime.com/wp-admin/admin-ajax.php', 
            new URLSearchParams({
                action: 'ajaxsearchpro_search',
                aspp: `${query}`,
                asid: '4',
                asp_inst_id: '4_2',
                'options[aspf][vf__1]': 'vf',
                'options[asp_gen][]': 'excerpt',
                'options[asp_gen][]': 'content',
                'options[asp_gen][]': 'title',
                filters_initial: '1',
                filters_changed: '0',
                qtranslate_lang: '0',
                current_page_id: '15'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
                'Accept': 'text/html',
                'Origin': 'https://v5.voiranime.com',
                'Referer': 'https://v5.voiranime.com/?filter=subbed'
            }
        });

        const responseData = response.data;

        // Extract HTML section from the response
        const htmlDataMatch = responseData.match(/___ASPSTART_HTML___(.*?)___ASPEND_HTML___/s);
        if (htmlDataMatch) {
            const $ = cheerio.load(htmlDataMatch[1]);

            // Collect data for each anime item
            const animeList = [];
            $('.asp_r_pagepost').each((index, element) => {
                const title = $(element).find('h3 a').text().trim();
                const link = $(element).find('h3 a').attr('href');

                animeList.push({ title, link });
            });

            return animeList;
        } else {
            console.log("HTML data not found in the response.");
            return [];
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

export const extractSearchVF = async (query) => {
    try {
        const response = await axios.post('https://v5.voiranime.com/wp-admin/admin-ajax.php', 
            new URLSearchParams({
                action: 'ajaxsearchpro_search',
                aspp: `${query}`,
                asid: '3',
                asp_inst_id: '3_2',
                'options[aspf][vf__1]': 'vf',
                'options[asp_gen][]': 'excerpt',
                'options[asp_gen][]': 'content',
                'options[asp_gen][]': 'title',
                filters_initial: '1',
                filters_changed: '0',
                qtranslate_lang: '0',
                current_page_id: '15'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
                'Accept': 'text/html',
                'Origin': 'https://v5.voiranime.com',
                'Referer': 'https://v5.voiranime.com/?filter=subbed'
            }
        });

        const responseData = response.data;

        // Extract HTML section from the response
        const htmlDataMatch = responseData.match(/___ASPSTART_HTML___(.*?)___ASPEND_HTML___/s);
        if (htmlDataMatch) {
            const $ = cheerio.load(htmlDataMatch[1]);

            // Collect data for each anime item
            const animeList = [];
            $('.asp_r_pagepost').each((index, element) => {
                const title = $(element).find('h3 a').text().trim();
                const link = $(element).find('h3 a').attr('href');

                animeList.push({ title, link });
            });

            return animeList;
        } else {
            console.log("HTML data not found in the response.");
            return null;
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

// Change the export statement to export the functions individually
export default { extractSearchVO, extractSearchVF }; // Export the functions for use in the controller
