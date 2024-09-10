import * as spotlightController from "../helperFrench/spotlight.helper.js";
//import * as trendingController from "../helperFrench/trending.helper.js";
export const getHomeInfo = async (req, res) => {
  try {
    const [spotlights, trending] = await Promise.all([
      spotlightController.getSpotlights(),
      //trendingController.getTrending(),
    ]);
    res.json({ success: true, results: { spotlights, trending } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};