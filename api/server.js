import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from 'morgan';
import NodeCache from 'node-cache';
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { handleHomePage } from "../src/controllers/home.controller.js";
import { handle404 } from "../src/controllers/404.controller.js";
import { getTrending } from "../src/hentai_scrapers/getTrending.js";
import { getVideo } from "../src/hentai_scrapers/getVideo.js";
import { getBrowse } from "../src/hentai_scrapers/getBrowse.js";
import { getBrowseVideos } from "../src/hentai_scrapers/getBrowseVideos.js";
import * as streamController from "../src/controllers/hianime/streamInfo.controller.js";
import * as searchController from "../src/controllers/hianime/search.controller.js";
import * as episodeListController from "../src/controllers/hianime/episodeList.controller.js";
import * as ASEpisodeListController from "../src/controllers/animeSama/animeSamaEpisodeList.controller.js";
import * as ASSearchController from "../src/controllers/animeSama/animeSamaSearch.controller.js";
import * as ASStreamController from "../src/controllers/animeSama/animeSamaStreamInfo.controller.js";
import * as VAEpisodeListController from "../src/controllers/voiranime/voiranimeEpisodeList.controller.js";
import * as VASearchController from "../src/controllers/voiranime/voiranimeSearch.controller.js";
import * as VAStreamController from "../src/controllers/voiranime/voiranimeStream.controller.js";
import * as versionChecker from "../src/frontendVersion/versionChecker.js";


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

app.get('/h/watch/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const formattedSlug = `${slug.trim().replace(/\s+/g, '-').toLowerCase()}`;
    console.log(formattedSlug)
    const jsondata = await getVideo(formattedSlug);
    res.json({success: true, results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/h/watch/:slug/:ep_num', async (req, res, next) => {
  try {
    const { slug, ep_num } = req.params;
    let formattedSlug = `${slug.trim().replace(/\s+/g, '-').toLowerCase()}`;
    if (ep_num !== '0') {
      formattedSlug += `-${ep_num}`;
    }
    console.log(formattedSlug)
    const jsondata = await getVideo(formattedSlug);
    res.json({success: true, results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/h/trending/:time/:page', async (req, res, next) => {
  try {
    const { time, page } = req.params;
    const jsondata = await getTrending(time, page);
    const nextPage = `/trending/${time}/${parseInt(page) + 1}`;
    res.json({ results: jsondata, next_page: nextPage });
  } catch (error) {
    next(error);
  }
});

app.get('/h/browse/:type', async (req, res, next) => {
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

app.get('/h/tags', async (req, res, next) => {
  try {
    const data = await getBrowse();
    const jsondata = data.hentai_tags.map((x) => ({ ...x, url: `/tags/${x.text}/0` }));
    res.json({ results: jsondata });
  } catch (error) {
    next(error);
  }
});

app.get('/h/:type/:category/:page', async (req, res, next) => {
  try {
    const { type, category, page } = req.params;
    const data = await getBrowseVideos(type, category, page);
    const nextPage = `/${type}/${category}/${parseInt(page) + 1}`;
    res.json({ results: data, next_page: nextPage });
  } catch (error) {
    next(error);
  }
});

app.get("/a/episodes/:id", cacheMiddleware, async (req, res) => {
  await episodeListController.getEpisodes(req, res);
});

app.get("/a/stream", async (req, res) => {
  await streamController.getStreamInfo(req, res);
});
app.get("/a/search", cacheMiddleware, async (req, res) => { // Updated endpoint to accept keyword and ep as query parameters
  await searchController.search(req, res);
});

app.get("/s/search", cacheMiddleware, async (req, res) => { // Updated endpoint to accept keyword and ep as query parameters
  await ASSearchController.search(req, res);
});

app.get("/s/episodes", cacheMiddleware, async (req, res) => {
  await ASEpisodeListController.getEpisodes(req, res);
});

app.get("/s/stream", async (req, res) => {
  await ASStreamController.getStream(req, res);
});

app.get("/v/search", cacheMiddleware, async (req, res) => { // Updated endpoint to accept keyword and ep as query parameters
  await VASearchController.search(req, res);
});

app.get("/v/episodes", cacheMiddleware, async (req, res) => {
  await VAEpisodeListController.getEpisodes(req, res);
});

app.get("/v/stream", cacheMiddleware, async (req, res) => {
  await VAStreamController.handleCaptcha(req, res);
});

app.get("/c", cacheMiddleware, async (req, res) => {
  await versionChecker.check(req, res);
});

app.get("*", handle404);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});