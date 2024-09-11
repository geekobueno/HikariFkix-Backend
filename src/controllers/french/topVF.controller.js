import extractTopVF from "../../extractors/french/topVF.extractor.js";

export const getTop = async (req, res) => {
  try {
    const topTen = await extractTopVF();
    res.json({ success: true, results: { topVF } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
