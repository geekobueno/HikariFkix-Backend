# HikariFlix-Backend

A backend service for HikariFlix, a React Native Expo streaming application for Android that integrates with the AniList GraphQL API. This service handles web scraping and provides streaming links through a REST API deployed on Vercel.

## Overview

HikariFlix-Backend serves as the core streaming link provider for the HikariFlix mobile application. It aggregates content from multiple sources and integrates with AniList for comprehensive anime information.

## Features

### Content Sources
The backend currently scrapes streaming links from:
- hianime.to - For anime streaming
- hanime.tv - For adult content
- anime-sama.fr - For French content (planned)

### Implementation Status
- ✅ English Anime Streaming
  - Supports both subbed and dubbed content
  - Implemented via hianime.to integration
- ✅ Adult Content Integration
  - Full support for hanime.tv content
- 🔄 French Anime Content (in work)
  - Will support both subbed and dubbed content
  - Integration with anime-sama.fr in development

## Architecture

- **Framework**: Node.js REST API
- **Deployment**: Vercel
- **API Integration**: AniList GraphQL API
- **Primary Function**: Streaming link aggregation and delivery

## Acknowledgments

This project builds upon the work of several open-source contributors:
- [itzzzme/anime-api](https://github.com/itzzzme/anime-api) - Core functionality for hianime.to scraping
- [Lishan778/hanime-api](https://github.com/Lishan778/hanime-api) - Integration support for hanime.tv

## Technical Details

The backend serves as a bridge between the HikariFlix mobile app and various content sources, while leveraging AniList's comprehensive anime database for metadata. All show information is obtained through the AniList API, with this backend focusing on streaming link aggregation.

## Legal Notice

This project is for educational purposes only. Please be aware of and respect the terms of service and usage rights for all integrated services.
