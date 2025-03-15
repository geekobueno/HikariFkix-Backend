import { jsongen } from '../utils/jsongen.js';

export const getTrending = async (time, page) => {
  const trendingUrl = `https://hanime.tv/api/v8/browse-trending?time=${time}&page=${page}&order_by=views&ordering=desc`;
  const urldata = await jsongen(trendingUrl);
  return urldata.hentai_videos.map((x) => ({
    id: x.id,
    name: x.name,
    slug: x.slug,
    cover_url: x.cover_url,
    views: x.views,
    link: `/watch/${x.slug}`,
  }));
};