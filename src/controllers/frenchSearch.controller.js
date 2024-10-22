import extractSearch from "../extractors/frenchSearch.extractor.js";

export const search = async (req, res) => {
    const title = req.query.keyword
    try {
      const data = await extractSearch(encodeURIComponent(title));
      res.json({ success: true, results: data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };