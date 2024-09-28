import extractSearchResults from "../extractors/search.extractor.js";
import countPages from "../helper/countPages.helper.js";
import { v1_base_url } from "../utils/base_v1.js";

export const search = async (req, res) => {
  try {
    let keyword = req.query.keyword.replace(/[{}]/g, ''); // Remove curly braces from the keyword.
    const totalPages = await countPages(
      `https://${v1_base_url}/search?keyword=${keyword}`
    );

    let bestMatch = null;
    let perfectMatch = null // Initialize a variable to hold the best match.
    for (let page = 1; page <= totalPages; page++) {
      const data = await extractSearchResults(encodeURIComponent(keyword), page);
      
      // Check for a perfect match using a for loop
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.title.toLowerCase() === keyword.toLowerCase()) {
          perfectMatch = item
          break;
        }
      }

      // If no perfect match found, look for the closest match
      if (!perfectMatch) {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (item.title.toLowerCase().includes(keyword.toLowerCase())) {
            if (!bestMatch || item.title.length < bestMatch.title.length) {
              bestMatch = item; // Update bestMatch if a closer match is found.
            }
          }
        }
      }

      if (perfectMatch) break; // Exit the outer loop if a match is found.
    }
    if (perfectMatch) {
      res.json({ success: true, result: perfectMatch }); // Return the best match found.
    }
    else if (bestMatch) {
      res.json({ success: true, result: bestMatch }); // Return the best match found.
    } else {
      res.json({ success: false, message: "No matches found." }); // Handle case where no matches are found.
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
