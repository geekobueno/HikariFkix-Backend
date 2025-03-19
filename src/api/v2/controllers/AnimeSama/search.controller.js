import extractSearch from "../../../../services/scrapers/AnimeSama/search.extractor.js";
import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";

export const search = async (req, res) => {
  const title = req.query.keyword;
  try {
    const data = await extractSearch(title);
    if (data) {
      res.json(ApiResponse.success(data));
    } else {
      throw new NotFoundError(`Nothing found for ${title}`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
