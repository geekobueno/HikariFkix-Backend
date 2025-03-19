export const config = {
  defaultVersion: "2548",
  alternateVersion: "810",
  languages: {
    subbed: "vostfr",
    dubbed: "vf",
  },
  chromium: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--disable-gpu",
      "--no-zygote",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  },
};
