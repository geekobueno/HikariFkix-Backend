import {version} from "./version.js"

export const check = (req, res) => {
    try {
      res.json({ success: true, results: version });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}