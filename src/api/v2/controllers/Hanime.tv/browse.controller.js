import extractBrowseData from "../../../../services/scrapers/Hanime.tv/browse.extractor.js";
import { ApiResponse } from "../../../../models/response.model.js";
import { NotFoundError } from "../../../../utils/error.util.js";

export const getBrowse = async (req, res) => {
  const { type, category, page, input } = req.params;

  try {
    const data = await extractBrowseData(type, category, page);
    const nextPage = `/${type}/${category}/${parseInt(page) + 1}`;
    res.json({ results: data, next_page: nextPage });
  } catch (error) {
    next(error);
  }
};
