import axios from "axios";
import * as cheerio from "cheerio";
import { v1_base_url } from "../../utils/base_v1.js";

const baseUrl = v1_base_url;

async function extractEpisodesList(id) {
  try {
    const showId = id.split("-").pop();
    const response = await axios.get(
      `https://${baseUrl}/ajax/v2/episode/list/${showId}`
    );
    const $ = cheerio.load(response.data.html);
    const episodes = new Map();
    let page = 1;
    let hasPages = false;
    while (true) {
      const pageSelector = `#episodes-page-${page}`;
      const pageExists = $(pageSelector).length > 0;
      if (!pageExists) break;
      hasPages = true;
      $(pageSelector)
        .find("a.ssl-item.ep-item")
        .each((i, el) => {
          const $el = $(el);
          const episodeId = `${id}?ep=` + $el.attr("data-id");
          episodes.set(episodeId, {
            episode_no: $el.attr("data-number"),
            id: episodeId,
            season_id: showId,
            episode_id: $el.attr("data-id"),
            title: $el.attr("title"),
            japanese_title: $el.find(".ep-name").attr("data-jname"),
          });
        });
      page++;
    }
    if (!hasPages) {
      $(".ss-list a.ssl-item.ep-item").each((i, el) => {
        const $el = $(el);
        const episodeId = `${id}?ep=` + $el.attr("data-id");
        episodes.set(episodeId, {
          number: $el.attr("data-number"),
          id: episodeId,
          season_id: showId,
          episode_id: $el.attr("data-id"),
          title: $el.attr("title"),
          japanese_title: $el.find(".ep-name").attr("data-jname"),
        });
      });
    }
    const episodesArray = Array.from(episodes.values());
    return episodesArray;
  } catch (error) {
    return error.message;
  }
}
export default extractEpisodesList;
