import { BaseScraper } from "../baseScraper.service.js";
import { parse } from "node-html-parser";

class AnimeSamaScraper extends BaseScraper {
  constructor() {
    super("https://animesamasite.com"); // Replace with actual base URL
  }

  async getEpisodeList(animeId) {
    const html = await this.fetch(`/anime/${animeId}`);
    const root = parse(html);
    // Parse the HTML and extract episode data
    const episodes = root.querySelectorAll(".episode-item").map((episode) => ({
      id: episode.getAttribute("data-id"),
      number: episode.querySelector(".episode-number").text,
      title: episode.querySelector(".episode-title").text,
      thumbnail: episode.querySelector("img").getAttribute("src"),
    }));
    return episodes;
  }

  async search(query) {
    const html = await this.fetch(`/search?q=${encodeURIComponent(query)}`);
    const root = parse(html); // Parse the HTML and extract search results
    const results = root.querySelectorAll(".search-result").map((result) => ({
      id: result.getAttribute("data-id"),
      title: result.querySelector(".result-title").text,
      thumbnail: result.querySelector("img").getAttribute("src"),
      type: result.querySelector(".result-type").text,
    }));
    return results;
  }
}

export const animeSamaScraper = new AnimeSamaScraper();
