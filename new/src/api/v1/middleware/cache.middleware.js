import NodeCache from "node-cache";
import cacheConfig from "../config/cache.config.js";

const cache = new NodeCache({
  stdTTL: cacheConfig.ttl,
  checkperiod: cacheConfig.checkPeriod,
});

export const cacheMiddleware =
  (type = "default") =>
  (req, res, next) => {
    if (!cacheConfig.enabled) {
      return next();
    }
    const key = req.originalUrl;
    const cachedResponse = cacheService.get(key);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Store the original send method
    const originalJson = res.json;

    // Override the json method to cache the response
    res.json = function (body) {
      cacheService.set(key, body, type);
      originalJson.call(this, body);
    };
    next();
  };
