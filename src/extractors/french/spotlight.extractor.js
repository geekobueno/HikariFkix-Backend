import axios from "axios";
import * as cheerio from "cheerio";
import formatTitle from "../../helper/french/formatTitle.helper.js";
import baseUrl from "../../utils/frenchUrl.js";

async function extractSpotlights() {
  try {
    const resp = await axios.get(`${baseUrl}/`);
    const $ = cheerio.load(resp.data);

    // Select the correct carousel elements
    const carouselElements = $(
      "div.wrap > div.main.center > div.related.tcarusel.carou-top > div.owl-carousel.caroustyle > div.item"
    );

    // Map through each element in the carousel
    const promises = carouselElements.map((ind, ele) => {
      const poster = $(ele).find("a > img").attr("src");
      const title = $(ele).find("a > span.title1").text().trim();
      const alternate_title = $(ele).find("a > span.title0").text().trim();
      const href = $(ele).find("a").attr("href");
      const data_id = href.split('/').pop().split('-')[0]; // Extract ID from URL
      
      const id = formatTitle(title, data_id); // Generate ID using helper function

      return {
        id,
        data_id,
        poster,
        title,
        alternate_title
      };
    }).get(); // Ensure map is called with .get() to retrieve all elements

    const serverData = await Promise.all(promises); // Process all promises

    return JSON.parse(JSON.stringify(serverData, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default extractSpotlights;
