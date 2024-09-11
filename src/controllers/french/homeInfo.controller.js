import * as spotlightController from "../../helper/french/spotlight.helper.js";
import * as topVFController from "../../helper/french/topVF.helper.js";
import * as topVostFRController from "../../helper/french/topVostFR.helper.js";

export const getHomeInfo = async (req, res) => {
  try {
    const [spotlights, topVF, topVostFR] = await Promise.all([
      spotlightController.getSpotlights(),
      topVFController.getTopVF(),
      topVostFRController.getTopVostFR()
    ]);
    
    res.json({ success: true, results: { spotlights, topVF, topVostFR } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};