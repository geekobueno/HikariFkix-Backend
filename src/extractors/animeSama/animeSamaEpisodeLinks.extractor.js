import axios from 'axios';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer';

const config = {
    defaultVersion: '2548',
    alternateVersion: '810',
    languages: {
        subbed: 'vostfr',
        dubbed: 'vf'
    },
    chromium: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--disable-gpu',
            '--no-zygote',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    }
};

// Initialize the browser based on environment
async function initBrowser() {
    try {
        if (process.env.VERCEL) {
            // Use puppeteer-core for Vercel
            const puppeteerCore = require('puppeteer-core');
            const options = {
                args: [...chromium.args, ...config.chromium.args],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: true,
                ignoreHTTPSErrors: true
            };
            
            console.log('Launching browser in Vercel with options:', JSON.stringify(options, null, 2));
            return await puppeteerCore.launch(options);
        } else {
            // Local development configuration with explicit browser launch options
            console.log('Launching browser in local environment');
            return await puppeteer.launch({
                product: 'chrome',
                headless: "new",
                ignoreHTTPSErrors: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                // Increase timeout for browser launch
                timeout: 30000,
            });
        }
    } catch (error) {
        console.error('Browser launch error:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Main scraping function with improved error handling
async function scrapeFilms(animeUrl, language) {
    let browser = null;
    let page = null;

    try {
        console.log('Initializing browser...');
        browser = await initBrowser();
        console.log('Browser initialized successfully');
        
        page = await browser.newPage();
        console.log('New page created');
        
        // Set viewport and user agent
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const url = `${animeUrl}/${language}`;
        console.log(`Navigating to: ${url}`);
        
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('Checking page content...');
        
        // Wait for selector with timeout
        await page.waitForSelector('#selectEpisodes option', { timeout: 5000 })
            .catch(() => console.log('Selector timeout - continuing anyway'));

        // Extract film data
        const films = await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll('#selectEpisodes option'));
            return options.map(element => ({
                text: element.textContent?.trim() || ''
            }));
        });

        console.log(`Found ${films.length} films`);
        return films;
    } catch (error) {
        console.error('Film scraping error details:', {
            message: error.message,
            stack: error.stack,
            url: animeUrl,
            language
        });
        return [];
    } finally {
        if (page) {
            await page.close().catch(console.error);
        }
        if (browser) {
            console.log('Closing browser');
            await browser.close().catch(console.error);
        }
    }
}

// Wait for network to be idle
async function waitForNetworkIdle(page, timeout = 10000, maxInflightRequests = 0) {
    try {
        await page.waitForNetworkIdle({ 
            timeout, 
            idleTime: 500, 
            maxInflightRequests 
        });
    } catch (error) {
        console.log('Network idle timeout reached:', error.message);
    }
}

// Function to extract episode arrays from content
function extractEpisodeArrays(content) {
    try {
        const eps1Match = content.match(/var\s+eps1\s*=\s*(\[.*?\]);/s);
        const eps2Match = content.match(/var\s+eps2\s*=\s*(\[.*?\]);/s);

        if (!eps1Match && !eps2Match) {
            throw new Error('No episode data found');
        }

        const eps1 = eps1Match ? eps1Match[1] : '[]';
        const eps2 = eps2Match ? eps2Match[1] : '[]';

        return { eps1, eps2 };
    } catch (error) {
        throw new Error(`Failed to extract episode data: ${error.message}`);
    }
}

// Fetch episodes by language with retry mechanism
async function fetchLanguageEpisodes(animeUrl, language, retryCount = 3) {
    for (let i = 0; i < retryCount; i++) {
        try {
            let films = [];
            if (animeUrl.includes('film')) {
                films = await scrapeFilms(animeUrl, language);
            }

            const query = `${animeUrl}/${language}/episodes.js?filever=${config.defaultVersion}`;
            const response = await axios.get(query);
            const { eps1, eps2 } = extractEpisodeArrays(response.data);

            const eps1Array = eps1.slice(1, -1).split(',')
                .map(item => item.trim())
                .filter(item => item && item !== "''");

            const eps2Array = eps2.slice(1, -1).split(',')
                .map(item => item.trim())
                .filter(item => item !== "''");

            const maxLength = Math.max(eps1Array.length, eps2Array.length);
            const episodes = [];

            for (let i = 0; i < maxLength; i++) {
                const sources = [];
                if (eps1Array[i]) {
                    sources.push({
                        source: '1',
                        url: eps1Array[i].replace(/['"]/g, ''),
                        ...(films.length > 0 && { name: films[i]?.text })
                    });
                }
                if (eps2Array[i]) {
                    sources.push({
                        source: '2',
                        url: eps2Array[i].replace(/['"]/g, ''),
                        ...(films.length > 0 && { name: films[i]?.text })
                    });
                }
                episodes.push(sources);
            }

            return episodes;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            if (i === retryCount - 1) {
                if (error.response?.status === 404) {
                    return [];
                }
                throw error;
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Rest of your code remains the same...

// Extract episode links for subbed and dubbed versions
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
