import axios from "axios";
import { extractEpisodeArrays } from "./extractEpArray.js";
import { scrapeFilms } from "./scrapeFilms.js";

export async function fetchLanguageEpisodes(
  animeUrl,
  language,
  retryCount = 3
) {
  for (let i = 0; i < retryCount; i++) {
    try {
      let films = [];
      if (animeUrl.includes("film")) {
        films = await scrapeFilms(animeUrl, language);
      }

      const query = `${animeUrl}/${language}/episodes.js?filever=${config.defaultVersion}`;
      const response = await axios.get(query);
      const { eps1, eps2 } = extractEpisodeArrays(response.data);

      const eps1Array = eps1
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "''");

      const eps2Array = eps2
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "''");

      const maxLength = Math.max(eps1Array.length, eps2Array.length);
      const episodes = [];

      for (let i = 0; i < maxLength; i++) {
        const sources = [];
        if (eps1Array[i]) {
          sources.push({
            source: "1",
            url: eps1Array[i].replace(/['"]/g, ""),
            ...(films.length > 0 && { name: films[i]?.text }),
          });
        }
        if (eps2Array[i]) {
          sources.push({
            source: "2",
            url: eps2Array[i].replace(/['"]/g, ""),
            ...(films.length > 0 && { name: films[i]?.text }),
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
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
