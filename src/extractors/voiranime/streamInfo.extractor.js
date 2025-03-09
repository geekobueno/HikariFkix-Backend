import axios from "axios";
import * as cheerio from "cheerio";

async function extractCaptcha(input) {
  try {
    const resp = await axios.get(input);
    const $ = cheerio.load(resp.data.html);
    const elements = $(
      ".seasons-block > #detail-ss-list > .detail-infor-content > .ss-list > a"
    );

    const episodes = elements
      .map((index, element) => {
        const title = $(element).attr("title");
        const episode_no = $(element).attr("data-number");
        const data_id = $(element).attr("data-id");
        const japanese_title = $(element)
          .find(".ssli-detail > .ep-name")
          .attr("data-jname");
        const id = seasonId + "?ep=" + data_id;
        return { data_id, id, episode_no, title, japanese_title };
      })
      .get();

    return episodes;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
}


export { extractCaptcha };
