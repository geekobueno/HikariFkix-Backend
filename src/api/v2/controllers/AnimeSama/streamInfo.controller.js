import { extractEpisodeLinks } from "../../../../services/scrapers/AnimeSama/stream.extractor.js";
import { ApiResponse } from "../../../../models/response.model.js";
import {
  NotFoundError,
  ValidationError,
} from "../../../../utils/error.util.js";

export const getStream = async (req, res) => {
  try {
    const animeUrl = req.query.url;
    if (!animeUrl) {
      throw new ValidationError(`Nothing found for ${animeUrl}`);
    }

    const response = await extractEpisodeLinks(animeUrl);

    if (!response?.success) {
      throw new NotFoundError(`Nothing found for ${animeUrl}`);
    }

    // Structure the response data
    const results = {
      animeUrl,
      totalEpisodes: response.totalEpisodes,
      episodes: response.episodes.map((ep) => ({
        episode: ep.episode,
        sources: {
          vostfr: ep.subbedSources || [],
          vf: ep.dubbedSources || [],
        },
      })),
    };
    res.json(ApiResponse.success(results));
  } catch (error) {
    if (error.message === "Invalid URL format") {
      throw new ValidationError(`Nothing found for ${animeUrl}`);
    }

    if (error.response?.status === 404) {
      throw new NotFoundError(`Nothing found for ${animeUrl}`);
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
