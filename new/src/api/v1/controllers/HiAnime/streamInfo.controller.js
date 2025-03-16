import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";
import {
  extractOtherEpisodes,
  extractStreamingInfo,
} from "../../../../services/scrapers/HiAnime/streamInfo.extractor";

export const getStreamInfo = async (req, res) => {
  try {
    const input = req.params.id;

    const match = input.match(/ep=(\d+)/);
    if (!match) {
      throw new Error("Invalid URL format");
    }
    const finalId = match[1];
    const [episodes, streamingInfo] = await Promise.all([
      extractOtherEpisodes(input),
      extractStreamingInfo(finalId),
    ]);
    const results = { streamingInfo, episodes };
    if (results) {
      res.json(ApiResponse.success(results));
    } else {
      throw new NotFoundError(`Stream info not found for ${input}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
