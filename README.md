# HikariFlix Backend  

The backend for the HikariFlix project, designed to scrape and provide streaming links for anime and hentai content.  

## Overview  

HikariFlix Backend is a web scraper that fetches streaming links from multiple sources and organizes them into a structured API. The backend retrieves anime metadata using the Anilist API and integrates multiple scraping services to provide a seamless experience.  

## Supported Sources  

- **Anime:**  
  - [hianime.to](https://hianime.to) (English sub/dub)  
  - [anime-sama.fr](https://anime-sama.fr) (French sub/dub - To be implemented)  

- **Hentai:**  
  - [hanime.tv](https://hanime.tv)  

### Acknowledgments  

This project is inspired by and extends the work of:  
- [itzzzme/anime-api](https://github.com/itzzzme/anime-api) – Scraping logic for hianime.to  
- [Lishan778/hanime-api](https://github.com/Lishan778/hanime-api) – Scraping logic for hanime.tv  

## Features  

✅ **English Anime Scraping (sub/dub)** – Completed  
✅ **Hentai Videos Scraping** – Completed  
🚧 **French Anime Scraping (sub/dub)** – In Progress  

## Refactor Plan  

A major refactor is underway to improve maintainability, scalability, and performance. Key improvements include:  
- Modular **project structure** with clear separation of concerns  
- Optimized **middleware** for caching, rate limiting, and error handling  
- Enhanced **scraper architecture** with a base scraper class and parallel processing  
- Improved **API design** with versioning and structured responses  
- Comprehensive **testing strategy** (unit & integration tests)  
- Strengthened **security** measures (rate limiting, validation, CORS protection)  

For detailed refactor guidelines, check the [Refactoring Guide](docs/RefactoringGuide.pdf).  

## Installation  

```sh
git clone https://github.com/yourusername/hikariflix-backend.git
cd hikariflix-backend
npm install
```

## Running the Server  

```sh
npm start
```

## API Documentation  

Once the refactor is complete, API documentation will be available at:  
```
http://localhost:PORT/api-docs
```
