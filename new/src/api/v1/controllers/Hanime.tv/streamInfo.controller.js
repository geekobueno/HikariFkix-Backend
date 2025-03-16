import extractVideoData from "../../../../services/scrapers/Hanime.tv/streamInfo.extractor.js";
import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";

export const getVideo = async (req, res) => {
  try {
    const { slug } = req.params;
    const formattedSlug = `${slug.trim().replace(/\s+/g, "-").toLowerCase()}`;
    const data = await extractVideoData(formattedSlug);
    if (data) {
      res.json(ApiResponse.success(data));
    } else {
      throw new NotFoundError(`Stream info not found for ${formattedSlug}`);
    }
  } catch (error) {
    next(error);
  }
};

export const getVideoWithEp = async (req, res) => {
  try {
    const { slug, ep_num } = req.params;
    let formattedSlug = `${slug.trim().replace(/\s+/g, "-").toLowerCase()}`;
    if (ep_num !== "0") {
      formattedSlug += `-${ep_num}`;
    }
    const data = await getVideo(formattedSlug);
    if (data) {
      res.json(ApiResponse.success(data));
    } else {
      throw new NotFoundError(`Stream info not found for ${formattedSlug}`);
    }
  } catch (error) {
    next(error);
  }
};
