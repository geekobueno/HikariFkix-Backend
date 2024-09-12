import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan';
import NodeCache from 'node-cache';
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { handleHomePage } from "../src/controllers/home.controller.js";
import { handle404 } from "../src/controllers/404.controller.js";
import { getTrending } from "../src/scrapers/getTrending.js";
import { getVideo } from "../src/scrapers/getVideo.js";
import { getBrowse } from "../src/scrapers/getBrowse.js";
import { getBrowseVideos } from "../src/scrapers/getBrowseVideos.js";

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.get('/watch/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const jsondata = await getVideo(slug);
    res.json({ results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/trending/:time/:page', async (req, res, next) => {
  try {
    const { time, page } = req.params;
    const jsondata = await getTrending(time, page);
    const nextPage = `/trending/${time}/${parseInt(page) + 1}`;
    res.json({ results: jsondata, next_page: nextPage });
  } catch (error) {
    next(error);
  }
});

app.get('/browse/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const data = await getBrowse();
    let jsondata = data[type];
    if (type === 'hentai_tags') {
      jsondata = jsondata.map((x) => ({ ...x, url: `/hentai-tags/${x.text}/0` }));
    } else if (type === 'brands') {
      jsondata = jsondata.map((x) => ({ ...x, url: `test${x.slug}/0` }));
    }
    res.json({ results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/tags', async (req, res, next) => {
  try {
    const data = await getBrowse();
    const jsondata = data.hentai_tags.map((x) => ({ ...x, url: `/tags/${x.text}/0` }));
    res.json({ results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/:type/:category/:page', async (req, res, next) => {
  try {
    const { type, category, page } = req.params;
    const data = await getBrowseVideos(type, category, page);
    const nextPage = `/${type}/${category}/${parseInt(page) + 1}`;
    res.json({ results: data, next_page: nextPage });
  } catch (error) {
    next(error);
  }
});

app.get("*", handle404);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});