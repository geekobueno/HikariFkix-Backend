import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer  from 'puppeteer';

const config = {
    defaultVersion: '2548',
    languages: {
        subbed: 'vostfr',
        dubbed: 'vf'
    }
};

function extractEpisodeArrays(content) {
    try {
        const eps1Match = content.match(/var\s+eps1\s*=\s*(\[.*?\]);/s);
        const eps2Match = content.match(/var\s+eps2\s*=\s*(\[.*?\]);/s);
        
        if (!eps1Match && !eps2Match) {
            throw new Error('No episode data found');
        }
        
        // Keep arrays as text strings instead of parsing
        const eps1 = eps1Match ? eps1Match[1] : '[]';
        const eps2 = eps2Match ? eps2Match[1] : '[]';
        
        // Basic validation to ensure they're array-like strings
        if (!eps1.startsWith('[') || !eps1.endsWith(']') ||
            !eps2.startsWith('[') || !eps2.endsWith(']')) {
            throw new Error('Invalid episode array format');
        }
        
        return { eps1, eps2 };
    } catch (error) {
        throw new Error(`Failed to extract episode data: ${error.message}`);
    }
}

async function fetchLanguageEpisodes(animeUrl, language) {
    try {
        const query = `${animeUrl}/${language}/episodes.js?filever=${config.defaultVersion}`;
        
        if (query.includes('film')) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`${animeUrl}/${language}`, { waitUntil: 'networkidle2' });
            
            const episodeOptions = await page.$$eval('#selectEpisodes option', options => 
                options.map((element, index) => ({
                    value: element.value,
                    text: element.textContent.trim(),
                    dataId: element.dataset.id,  // if there's a data-id attribute
                    index: index
                }))
            );

            console.log(episodeOptions);
            await browser.close();
        }
        const response = await axios.get(query);
        const { eps1, eps2 } = extractEpisodeArrays(response.data);
        
        // Convert text arrays into array-like structures without parsing JSON
        // Remove the brackets and split by comma, handling potential empty strings
        const eps1Array = eps1.slice(1, -1).split(',')
            .map(item => item.trim())
            .filter(item => item && item !== "''");
            
        const eps2Array = eps2.slice(1, -1).split(',')
            .map(item => item.trim())
            .filter(item => item && item !== "''");

        // Create an array with the length of the longer episode list
        const maxLength = Math.max(eps1Array.length, eps2Array.length);
        const episodes = [];

        for (let i = 0; i < maxLength; i++) {
            const sources = [];
            if (eps1Array[i]) {
                sources.push({
                    source: '1',
                    url: eps1Array[i].replace(/['"]/g, '')
                });
            }
            if (eps2Array[i]) {
                sources.push({
                    source: '2',
                    url: eps2Array[i].replace(/['"]/g, '')
                });
            }
            episodes.push(sources);
        }

        return episodes;
    } catch (error) {
        if (error.response?.status === 404) {
            return [];
        }
        throw error;
    }
}

export async function extractEpisodeLinks(animeUrl) {
    try {
        const [subbedEpisodes, dubbedEpisodes] = await Promise.all([
            fetchLanguageEpisodes(animeUrl, config.languages.subbed),
            fetchLanguageEpisodes(animeUrl, config.languages.dubbed)
        ]);

        const maxEpisodes = Math.max(
            subbedEpisodes.length,
            dubbedEpisodes.length
        );

        if (maxEpisodes === 0) {
            return {
                success: false,
                error: 'No episodes found',
                episodes: []
            };
        }

        const episodes = Array.from({ length: maxEpisodes }, (_, i) => ({
            episode: i + 1,
            subbedSources: subbedEpisodes[i] || [],
            dubbedSources: dubbedEpisodes[i] || [],
            metadata: {
                hasSubbed: Boolean(subbedEpisodes[i]?.length),
                hasDubbed: Boolean(dubbedEpisodes[i]?.length),
                totalSources: (subbedEpisodes[i]?.length || 0) + (dubbedEpisodes[i]?.length || 0)
            }
        }));

        return {
            success: true,
            totalEpisodes: maxEpisodes,
            languages: {
                subbed: Boolean(subbedEpisodes.length),
                dubbed: Boolean(dubbedEpisodes.length)
            },
            episodes
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to extract episode links',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            episodes: []
        };
    }
}

export default {
    extractEpisodeLinks,
    config
};