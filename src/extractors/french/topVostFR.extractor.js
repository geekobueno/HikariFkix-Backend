import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../../helper/french/formatTitle.helper.js";
import baseUrl from "../../utils/frenchUrl.js";

// Set Axios defaults
axios.defaults.baseURL = baseUrl;

async function extractTopVostFR() {
  try {
    const resp = await axios.get("/");
    const $ = cheerio.load(resp.data);

    const data = $(
      "div.wrap > div.main.center > div#cols.cols.clearfix > div.block-main:nth-child(1)"
    )
      .map((index, element) => {
        const title = $("div.mov.clearfix > a.mov-t.nowrap", element).text().trim();
        const poster = $("div.mov.clearfix > div.mov-i.img-box.aaa > img", element).attr("src");
        const href = $(ele).find("div.mov.clearfix > a.mov-t.nowrap").attr("href");
        const data_id = href.split('/').pop().split('-')[0];
        const id=formatTitle(title, data_id);
        const ep = $("div.mov.clearfix > div.mov-i.img-box.aaa > div.mov-m", element).text().trim();
        const season = $("div.mov.clearfix > div.mov-i.img-box.aaa > div.nbloc1-2 > span.block-sai", element).text().trim();

        return {id, data_id, title, poster, ep , season};
      })
      .get();

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export default extractTopVostFR;
