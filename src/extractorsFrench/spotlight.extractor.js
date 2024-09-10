import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../helperGeneral/formatTitle.helper.js";
import baseUrl from "../utils/frenchUrl.js";
import fs  from 'fs'


const outputFilePath = 'output.html';

async function extractSpotlights() {
  try {
    const resp = await axios.get(`${baseUrl}/`);
    const $ = cheerio.load(resp.data);
    fs.writeFileSync(outputFilePath, $.html(), 'utf8');
        console.log(`HTML saved to ${outputFilePath}`);

    const slideElements = $(
      "div.wrap > div.main.center >div.related.tcarusel.carou-top > div.owl-carousel.caroustyle.owl-loaded.owl-drag > div.owl-stage-outer > div.owl-stage"
    );

    const promises = slideElements
      .map(async (ind, ele) => {
        const poster = $(ele)
          .find(
            "div.owl-item.cloned > div.item > a > img"
          )
          .attr("src");
        const title = $(ele)
          .find(
            "div.owl-item.cloned > div.item > a > span.title1"
          )
          .text()
          .trim();
        const japanese_title = $(ele)
          .find(
            "div.owl-item.cloned > div.item > a > span.title0"
          )
          .text()
          .trim();
        const href = $(ele)
          .find(
            "div.owl-item.cloned > div.item > a"
          )
          .attr("href");
        const data_id = href.split('/').pop().split('-')[0];
        const id = formatTitle(title, data_id);
        return {
          id,
          data_id,
          poster,
          title,
          japanese_title
        };
      })
      .get();

    const serverData = await Promise.all(promises);
    return JSON.parse(JSON.stringify(serverData, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

export default extractSpotlights;
