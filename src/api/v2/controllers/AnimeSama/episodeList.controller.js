import extractEpisodesList from "../../../../services/scrapers/AnimeSama/episodeList.extractor.js";
import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";

export const getEpisodes = async (req, res) => {
  const link = req.query.link;
  try {
    const data = await extractEpisodesList(link);
    if (data) {
      res.json(ApiResponse.success(data));
    } else {
      throw new NotFoundError(`Nothing found for ${link}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
