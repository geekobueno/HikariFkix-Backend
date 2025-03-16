import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";
import * as searchController from "../controllers/HiAnime/search.controller.js";
import * as streamController from "../controllers/HiAnime/streamInfo.controller.js";
import * as episodeListController from "../controllers/HiAnime/episodeList.controller";


const router = Router();

router.get(
  "/episodes/:id",
  cacheMiddleware("episodeList"),
  episodeListController.getEpisodes
);

router.get("/search", cacheMiddleware("search"), searchController.search);

router.get(
  "/stream/:id",
  cacheMiddleware,
  streamController.getStreamInfo
);

export default router;
