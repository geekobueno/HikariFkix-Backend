import extractSearchResults from "../../extractors/hianime/search.extractor.js";
import countPages from "../../helper/countPages.helper.js";
import { v1_base_url } from "../../utils/base_v1.js";
import levenshtein from 'fast-levenshtein';

// Helper function to normalize strings (remove diacritics and special characters)
const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim();
};

export const search = async (req, res) => {
  try {
    const keyword = normalizeString(req.query.keyword.replace(/[{}]/g, '').split('?ep=')[0]); // Normalize the keyword and remove ?ep=74
    const ep = req.query.keyword.split('?ep=')[1].replace(/[{}]/g, ''); // Extract the episode number and remove {}
    const totalPages = await countPages(`https://${v1_base_url}/search?keyword=${keyword}`);

    let bestMatch = null;
    let perfectMatch = null;
    let closestDistance = Infinity; // Initialize a variable to track the closest match

    for (let page = 1; page <= totalPages; page++) {
      const data = await extractSearchResults(encodeURIComponent(keyword), page);
      for (const item of data) {
        const normalizedTitle = normalizeString(item.title);
        const normalizedJapaneseTitle = item.japanese_title ? normalizeString(item.japanese_title.replace(/[\u201C\u201D]/g, '')) : null; // Normalize Japanese title and remove weird characters
        // Check for a perfect match
        if (normalizedTitle === keyword && (ep === '0' || item.tvInfo.eps === ep || item.tvInfo.sub === ep) || 
            (normalizedJapaneseTitle === keyword && (ep === '0' || item.tvInfo.eps === ep || item.tvInfo.sub === ep))) { // Check if title matches first, then Japanese title, and episode matches if ep is not 0
          perfectMatch = item;
          break;
        }

        // Fuzzy matching using Levenshtein distance
        const distanceTitle = levenshtein.get(normalizedTitle, keyword);
        const distanceJapaneseTitle = normalizedJapaneseTitle ? levenshtein.get(normalizedJapaneseTitle, keyword) : Infinity; // Calculate distance for Japanese title if it exists

        // Determine the closest match between title and Japanese title
        if (distanceTitle < closestDistance && (ep === '0' || item.tvInfo.eps === ep)) { // Check normalized title first
          bestMatch = item;
          closestDistance = distanceTitle;
        } 
        if (distanceJapaneseTitle < closestDistance && (ep === '0' || item.tvInfo.eps === ep)) { // Check Japanese title if title doesn't match
          bestMatch = item;
          closestDistance = distanceJapaneseTitle;
        }
        
      }

      if (perfectMatch) break; // Exit the loop if a perfect match is found
    }

    if (perfectMatch) {
      res.json({ success: true, result: perfectMatch }); // Return the perfect match found
    } else if (bestMatch) {
      res.json({ success: true, result: bestMatch }); // Return the closest match found
    } else {
      res.json({ success: false, message: "No matches found." }); // Handle case where no matches are found
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
