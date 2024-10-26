import NodeCache from 'node-cache';
import { extractEpisodeLinks } from "../../extractors/animeSama/animeSamaEpisodeLinks.extractor.js";

// Initialize cache with 1 hour TTL and check every 2 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export const getStream = async (req, res) => {
    try {
        // Get the anime URL from query parameters
        const animeUrl = req.query.url;
        if (!animeUrl) {
            return res.status(400).json({
                success: false,
                error: "Missing anime URL parameter"
            });
        }

        // Generate cache key based on anime URL
        const cacheKey = `episode-links-${animeUrl}`;

        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json({
                success: true,
                results: cachedData
            });
        }

        // Extract episodes for both subbed and dubbed versions
        const response = await extractEpisodeLinks(animeUrl);

        // If no episodes found or invalid response, return appropriate error
        if (!response?.success || !response?.episodes || response.episodes.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No episodes found for this anime"
            });
        }

        // Structure the response data
        const results = {
            animeUrl,
            totalEpisodes: response.totalEpisodes,
            episodes: response.episodes.map(ep => ({
                episode: ep.episode,
                sources: {
                    vostfr: ep.subbedSources || [],
                    vf: ep.dubbedSources || []
                }
            }))
        };

        // Cache the results
        cache.set(cacheKey, results);

        // Send successful response
        res.json({
            success: true,
            results
        });
    } catch (error) {
        // Log the error for debugging
        console.error('Episode Links Extraction Error:', error);

        // Determine appropriate error response
        if (error.message === "Invalid URL format") {
            return res.status(400).json({
                success: false,
                error: "Invalid anime URL format"
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                error: "Anime not found"
            });
        }

        // Default error response
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};