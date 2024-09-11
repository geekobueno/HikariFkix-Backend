import extractTopVostFR from "../../extractors/french/topVostFR.extractor.js";

export const getTopVostFR = async () => {
  try {
    const topVostFR = await extractTopVostFR();
    // console.log(topVostFR)
    return topVostFR;
    // res.json({ success: true, results: { topVostFR } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
