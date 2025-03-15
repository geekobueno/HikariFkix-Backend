import NodeCache from 'node-cache';
import { extractCaptcha } from "../../extractors/voiranime/streamInfo.extractor.js";

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export const handleCaptcha = async (req, res) => {
  try {
    const input = req.query.id;
    const cacheKey = `streamInfo-${input}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, results: cachedData });
    }
    const [iframe] = await Promise.all([
      extractCaptcha(input),
    ]);
    const results = { iframe };
    cache.set(cacheKey, results);
    res.json({ success: true, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
