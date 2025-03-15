import axios from "axios";
import { HttpError } from "../../utils/errors.util.js";
export class BaseScraper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
  }
  async fetch(url, options = {}) {
    try {
      const response = await this.client.get(url, options);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpError(
          `Failed to fetch from ${url}: ${error.response.status} ${error.response.statusText}`,
          error.response.status
        );
      }
      throw new HttpError(
        `Network error when fetching ${url}: ${error.message}`,
        500
      );
    }
  }
  async post(url, data, options = {}) {
    try {
      const response = await this.client.post(url, data, options);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpError(
          `Failed to post to ${url}: ${error.response.status} ${error.response.statusText}`,
          error.response.status
        );
      }
      throw new HttpError(
        `Network error when posting to ${url}: ${error.message}`,
        500
      );
    }
  }
}
