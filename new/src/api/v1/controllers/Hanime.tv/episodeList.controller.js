import { ApiResponse } from "../../../models/response.model.js";
import { animeSamaScraper } from "../../../services/scrapers/anime/animeSamaScraper.service.js";
import { NotFoundError } from "../../../utils/errors.util.js";

class AnimeEpisodeListController {
  async getEpisodeList(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json(ApiResponse.error("Anime ID is required", 400));
      }
      const episodes = await animeSamaScraper.getEpisodeList(id);
      if (!episodes) {
        throw new NotFoundError(`Episode List with ID ${id} not found`);
      }
        
      return res.json(ApiResponse.success(episodes));
    } catch (error) {
      next(error);
    }
  }
}

export default new AnimeEpisodeListController();
