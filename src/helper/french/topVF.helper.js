import extractTopVF from "../../extractors/french/topVF.extractor.js";

export const getTopVF = async () => {
  try {
    const topVF = await extractTopVF();
    // console.log(topVF)
    return topVF;
    // res.json({ success: true, results: { topVF } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
