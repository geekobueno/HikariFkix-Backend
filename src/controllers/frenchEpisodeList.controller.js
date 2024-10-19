import extractEpisodesList from "../extractors/frenchEpisodeList.extractor.js";

export const getEpisodes = async (req, res) => {
    const title = req.params.title.toLowerCase().split(' ').join('-');
    try {
      const data = await extractEpisodesList(encodeURIComponent(title));
      res.json({ success: true, results: data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };