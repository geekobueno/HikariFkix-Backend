import * as spotlightController from "../../helper/french/spotlight.helper.js";
export const getHomeInfo = async (req, res) => {
  try {
    const [spotlights] = await Promise.all([
      spotlightController.getSpotlights()
    ]);
    
    res.json({ success: true, results: { spotlights, trending } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};