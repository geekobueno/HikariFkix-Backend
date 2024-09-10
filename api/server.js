import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan';
import NodeCache from 'node-cache';
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { handleHomePage } from "../src/controllers/home.controller.js";

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

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});