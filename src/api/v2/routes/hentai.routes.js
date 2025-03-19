import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";
import * as browseController from "../controllers/Hanime.tv/browse.controller.js";
import * as streamController from "../controllers/Hanime.tv/streamInfo.controller.js";
import { errorHandlerMiddleware } from "../middleware/errorHandler.middleware.js";

const router = Router();

router.get(
  "/h/watch/:slug",
  cacheMiddleware("videoData"),
  errorHandlerMiddleware,
  streamController.getVideo
);

router.get(
  "/h/:type/:category/:input/:page",
  cacheMiddleware("browseData"),
  errorHandlerMiddleware,
  browseController.getBrowse
);

router.get(
  "/h/watch/:slug/:ep_num",
  cacheMiddleware("videoData"),
  errorHandlerMiddleware,
  streamController.getVideoWithEp
);

export default router;
