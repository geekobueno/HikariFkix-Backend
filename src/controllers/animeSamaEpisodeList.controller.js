import extractEpisodesList from "../extractors/animeSamaEpisodeList.extractor.js";

export const getEpisodes = async (req, res) => {
    const link = req.query.link;
    try {
      const data = await extractEpisodesList(link);
      res.json({ success: true, results: data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };