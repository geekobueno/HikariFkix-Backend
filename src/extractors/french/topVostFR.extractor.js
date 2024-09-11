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

    const data = $(
      "div.block-main"
    ).first()

    const promises = data.map((index, element) => {
        const title = $(element).find("div.mov > a.mov-t.nowrap").text().trim();
        const poster = $(element).find("div.mov > div.mov-i > img").attr("src");
        const href = $(element).find("div.mov > div.mov-i > div.mov-mask").attr("data-link");
        const data_id = href.split('/').pop().split('-')[0];
        const id = formatTitle(title, data_id);
        const ep = $(element).find("div.mov > div.mov-i > div.mov-m").text().trim();
        const season = $(element).find("div.mov > div.mov-i > div.nbloc1-2 > span.block-sai").text().trim();

        return {id, data_id, title, poster, ep , season};
      }).get();

      const serverData = await Promise.all(promises);

      return JSON.parse(JSON.stringify(serverData, null, 2));  } catch (error) {
    console.error("Error fetching or writing data:", error);
    throw error;
  }
}

export default extractTopVostFR;
