import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan';
import NodeCache from 'node-cache';
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { handleHomePage } from "../src/controllers/home.controller.js";
import { handle404 } from "../src/controllers/404.controller.js";
//import { routeTypes } from "../src/routes/frenchCategory.route.js";

import * as homeInfoController from "../src/controllers/french/homeInfo.controller.js";
import * as topVFController from "../src/controllers/french/topVF.controller.js";
import * as topVostFRController from "../src/controllers/french/topVostFR.controller.js";


dotenv.config()

const app = express();
const port = process.env.PORT || 6969;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 1800 });

app.use(cors());
app.use(express.static(join(dirname(__dirname), "public")));
app.use(morgan('combined'));

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };

  next();
};

app.get("/", handleHomePage);

app.get("/api/french", cacheMiddleware, async (req, res) => {
  await homeInfoController.getHomeInfo(req, res);
});

app.get("/api/french/top-vf", cacheMiddleware, async (req, res) => {
  await topVFController.getTop(req, res);
});

app.get("/api/french/top-vostfr", cacheMiddleware, async (req, res) => {
  await topVostFRController.getTop(req, res);
});

app.get("*", handle404);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});