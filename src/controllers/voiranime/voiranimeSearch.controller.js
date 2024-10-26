import {extractSearchVF,extractSearchVO} from "../../extractors/voiranime/voiranimeSearch.extractor.js";

export const search = async (req, res) => {
    const title = req.query.keyword
    try {
      const data = await extractSearchVO(title);
      const data2 = await extractSearchVF(title);
      res.json({ success: true, results: { VO: data, VF: data2 } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
