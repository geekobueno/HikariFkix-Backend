import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../../helper/french/formatTitle.helper.js";
import baseUrl from "../../utils/frenchUrl.js";
import fs from 'fs/promises';

// Set Axios defaults
axios.defaults.baseURL = baseUrl;

async function extractTopVostFR() {
  try {
    const resp = await axios.get("/");
    const $ = cheerio.load(resp.data);

    // Select the first block-main div
    const firstBlockMain = $("div.block-main").first();

    // Find all anime entries within the first block-main
    const animeEntries = firstBlockMain.find("div.mov");

    const serverData = animeEntries.map((index, element) => {
      const $element = $(element);
      const title = $element.find("a.mov-t.nowrap").text().trim();
      const poster = $element.find("div.mov-i > img").attr("src");
      const href = $element.find("div.mov-i > div.mov-mask").attr("data-link");
      const data_id = href.split('/').pop().split('-')[0];
      const id = formatTitle(title, data_id);
      const ep = $element.find("div.mov-i > div.mov-m").text().trim();
      const seasonText = $element.find("div.nbloc1-2 > span.block-sai").text().trim();
      const seasonMatch = seasonText.match(/Saison\s*(\d+)/i);
      const season = seasonMatch ? seasonMatch[1] : "";
      
      return {id, data_id, title, poster, ep, season};
    }).get();

    return JSON.parse(JSON.stringify(serverData, null, 2));
  } catch (error) {
    console.error("Error fetching or writing data:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default extractTopVostFR;
