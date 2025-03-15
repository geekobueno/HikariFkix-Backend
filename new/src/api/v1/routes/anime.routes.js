import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";
import animeEpisodeListController from "../controllers/anime/episodeList.controller.js";
import animeSearchController from "../controllers/anime/search.controller.js";
import animeStreamInfoController from "../controllers/anime/streamInfo.controller.js";

const router = Router();

router.get(
  "/episodes/:id",
  cacheMiddleware("episodeList"),
  animeEpisodeListController.getEpisodeList
);

router.get("/search", cacheMiddleware("search"), animeSearchController.search);
router.get(
  "/stream/:id",
  cacheMiddleware,
  animeStreamInfoController.getStreamInfo
);

export default router;
