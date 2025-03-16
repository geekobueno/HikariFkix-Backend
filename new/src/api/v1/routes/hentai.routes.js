import { Router } from "express";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";
import * as browseController from "../controllers/Hanime.tv/browse.controller.js";
import * as streamController from "../controllers/Hanime.tv/streamInfo.controller.js";

const router = Router();

router.get(
  "/h/watch/:slug",
  cacheMiddleware("videoData"),
  streamController.getVideo
);

router.get(
  "/h/:type/:category/:input/:page",
  cacheMiddleware("browseData"),
  browseController.getBrowse
);

router.get(
  "/h/watch/:slug/:ep_num",
  cacheMiddleware("videoData"),
  streamController.getVideoWithEp
);

export default router;
