import { config } from "./streamUtils/config";
import { fetchLanguageEpisodes } from "./streamUtils/fetchLanguage.js";
//import { WaitForNetworkIdle } from "./streamUtils/networkWait.js";

// Extract episode links for subbed and dubbed versions
export async function extractEpisodeLinks(animeUrl) {
  try {
    const [subbedEpisodes, dubbedEpisodes] = await Promise.all([
      fetchLanguageEpisodes(animeUrl, config.languages.subbed),
      fetchLanguageEpisodes(animeUrl, config.languages.dubbed),
    ]);

    const maxEpisodes = Math.max(subbedEpisodes.length, dubbedEpisodes.length);

    if (maxEpisodes === 0) {
      return {
        success: false,
        error: "No episodes found",
        episodes: [],
      };
    }

    const episodes = Array.from({ length: maxEpisodes }, (_, i) => ({
      episode: i + 1,
      subbedSources: subbedEpisodes[i] || [],
      dubbedSources: dubbedEpisodes[i] || [],
      metadata: {
        hasSubbed: Boolean(subbedEpisodes[i]?.length),
        hasDubbed: Boolean(dubbedEpisodes[i]?.length),
        totalSources:
          (subbedEpisodes[i]?.length || 0) + (dubbedEpisodes[i]?.length || 0),
      },
    }));

    return {
      success: true,
      totalEpisodes: maxEpisodes,
      languages: {
        subbed: Boolean(subbedEpisodes.length),
        dubbed: Boolean(dubbedEpisodes.length),
      },
      episodes,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to extract episode links",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      episodes: [],
    };
  }
}

export default {
  extractEpisodeLinks,
};
