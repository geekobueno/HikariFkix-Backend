import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../../helper/french/formatTitle.helper.js";
import baseUrl from "../../utils/frenchUrl.js";

// Set Axios defaults
axios.defaults.baseURL = baseUrl;

async function extractTopVF() {
  try {
    const resp = await axios.get(`${baseUrl}/`);
    const $ = cheerio.load(resp.data);

    // Select the second block-main div
    const secondBlockMain = $("div.block-main").eq(1);

    // Find all anime entries within the second block-main
    const animeEntries = secondBlockMain.find("div.mov");

    const serverData = animeEntries.map((index, element) => {
      const $element = $(element);
      const title = $element.find("a.mov-t.nowrap").text().trim();
      const poster = $element.find("div.mov-i > img").attr("src");
      const href = $element.find("div.mov-i > div.mov-mask").attr("data-link");
      const data_id = href.split('/').pop().split('-')[0];
      const id = formatTitle(title, data_id);
      const ep = $element.find("div.mov-i > div.mov-m").text().trim();
      
      // Extract season information
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

export default extractTopVF;
