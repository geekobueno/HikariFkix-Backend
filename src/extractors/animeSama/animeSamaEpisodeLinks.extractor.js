import axios from 'axios';

const config = {
    defaultVersion: '2548',
    alternateVersion: '810',
    languages: {
        subbed: 'vostfr',
        dubbed: 'vf'
    },
    chromium: {
        revision: '1095492', // Latest stable version
        downloadHost: 'https://storage.googleapis.com/chromium-browser-snapshots'
    }
};

function extractEpisodeArrays(content) {
    try {
        const eps1Match = content.match(/var\s+eps1\s*=\s*(\[.*?\]);/s);
        const eps2Match = content.match(/var\s+eps2\s*=\s*(\[.*?\]);/s);
        
        if (!eps1Match && !eps2Match) {
            throw new Error('No episode data found');
        }
        
        const eps1 = eps1Match ? eps1Match[1] : '[]';
        const eps2 = eps2Match ? eps2Match[1] : '[]';
        
        if (!eps1.startsWith('[') || !eps1.endsWith(']') ||
            !eps2.startsWith('[') || !eps2.endsWith(']')) {
            throw new Error('Invalid episode array format');
        }
        
        return { eps1, eps2 };
    } catch (error) {
        throw new Error(`Failed to extract episode data: ${error.message}`);
    }
}

async function downloadChromium(puppeteer, targetPath) {
    console.log('Downloading Chromium...');
    const browserFetcher = puppeteer.createBrowserFetcher({
        path: targetPath
    });

    try {
        const revisionInfo = await browserFetcher.download(config.chromium.revision);
        console.log(`Chromium downloaded successfully to: ${revisionInfo.executablePath}`);
        return revisionInfo.executablePath;
    } catch (error) {
        console.error('Failed to download Chromium:', error);
        throw error;
    }
}

async function initBrowser() {
    if (process.env.VERCEL) {
        // Vercel environment
        const chromium = await import('@sparticuz/chromium');
        const puppeteer = await import('puppeteer-core');

        return await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: "new"
        });
    } else {
        // Local environment with automatic Chromium setup
        const { mkdir } = await import('fs/promises');
        const { join } = await import('path');
        const puppeteer = await import('puppeteer');
        
        // Setup Chromium directory
        const chromiumPath = join(process.cwd(), '.cache', 'chromium');
        await mkdir(chromiumPath, { recursive: true }).catch(() => {});

        let executablePath;
        try {
            // Try to download Chromium if not already present
            executablePath = await downloadChromium(puppeteer, chromiumPath);
        } catch (error) {
            console.warn('Failed to download Chromium, falling back to system installation');
            executablePath = process.platform === 'win32' 
                ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                : process.platform === 'darwin'
                    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                    : '/usr/bin/google-chrome';
        }

        return await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath
        });
    }
}

async function scrapeFilms(animeUrl, language) {
    let browser = null;
    
    try {
        browser = await initBrowser();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`Navigating to: ${animeUrl}/${language}`);

        await page.goto(`${animeUrl}/${language}`, {
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        const films = await page.$$eval('#selectEpisodes option', options =>
            options.map(element => ({
                text: element.textContent?.trim() || ''
            }))
        );

        return films;
    } catch (error) {
        console.error('Film scraping error:', error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function fetchLanguageEpisodes(animeUrl, language) {
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
                    ...(films.length > 0 && { name: films[i].text })
                });
            }
            if (eps2Array[i]) {
                sources.push({
                    source: '2',
                    url: eps2Array[i].replace(/['"]/g, ''),
                    ...(films.length > 0 && { name: films[i].text })
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