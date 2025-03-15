import NodeCache from "node-cache";
import cacheConfig from "../config/cache.config.js";

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: cacheConfig.ttl,
      checkperiod: cacheConfig.checkPeriod,
    });
    // Define cache TTLs for different resource types
    this.ttlMap = {
      search: 3600, // 1 hour for search results
      episodeList: 86400, // 24 hours for episode lists
      trending: 7200, // 2 hours for trending content
      video: 43200, // 12 hours for video metadata
    };
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, type = "default") {
    const ttl = this.ttlMap[type] || cacheConfig.ttl;
    return this.cache.set(key, value, ttl);
  }

  delete(key) {
    return this.cache.del(key);
  }

  clear() {
    return this.cache.flushAll();
  }

  // Invalidate cache based on pattern
  invalidatePattern(pattern) {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    matchingKeys.forEach((key) => {
      this.cache.del(key);
    });
    return matchingKeys.length;
  }
}

export const cacheService = new CacheService();
