import {extractSearchVF,extractSearchVO} from "../../extractors/voiranime/voiranimeSearch.extractor.js";
import levenshtein from 'fast-levenshtein';

export const search = async (req, res) => {
    const title = req.query.keyword
    try {
      const data = await extractSearchVO(title);
      let closestDistanceVO = Infinity; 
      let bestMatchVO = null;
      for (const item of data){
        const distance = levenshtein.get(item.title, title)
        if (distance < closestDistanceVO) { // Check normalized title first
          bestMatchVO = item;
          closestDistanceVO = distance;
        } 
      }
      const data2 = await extractSearchVF(title);
      let closestDistanceVF = Infinity; 
      let bestMatchVF = null;
      for (const item of data2){
        const distance = levenshtein.get(item.title.replace(/\(VF\)$/, ''), bestMatchVO.title.replace(/\(VF\)$/, ''))
        if (distance < closestDistanceVF) { // Check normalized title first
          bestMatchVF = item;
          closestDistanceVF = distance;
        } 
      }
      res.json({ success: true, results: { VO: bestMatchVO, VF: bestMatchVF } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
