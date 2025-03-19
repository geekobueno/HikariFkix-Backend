import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";
import * as searchController from "../controllers/HiAnime/search.controller.js";
import * as streamController from "../controllers/HiAnime/streamInfo.controller.js";
import * as episodeListController from "../controllers/HiAnime/episodeList.controller.js";
import { errorHandlerMiddleware } from "../middleware/errorHandler.middleware.js";

const router = Router();

router.get(
  "/episodes/:id",
  cacheMiddleware("episodeList"),
  errorHandlerMiddleware,
  episodeListController.getEpisodes
);

router.get(
  "/search",
  cacheMiddleware("search"),
  errorHandlerMiddleware,
  searchController.search
);

router.get(
  "/stream/:id",
  cacheMiddleware("streamInfo"),
  errorHandlerMiddleware,
  streamController.getStreamInfo
);

export default router;
