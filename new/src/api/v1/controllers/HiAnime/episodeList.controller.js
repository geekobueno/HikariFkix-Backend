import extractEpisodesList from "../../../../services/scrapers/HiAnime/episodeList.extractor";
import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";

export const getEpisodes = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await extractEpisodesList(encodeURIComponent(id));
    if (data) {
      res.json(ApiResponse.success(data));
    } else {
      throw new NotFoundError(`Episode list not found fr ${id}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
