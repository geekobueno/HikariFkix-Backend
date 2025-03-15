import { jsongen } from '../utils/jsongen.js';

export const getBrowseVideos = async (type, category, page) => {
  const browseUrl = `https://hanime.tv/api/v8/browse/${type}/${category}?page=${page}&order_by=views&ordering=desc`;
  const browsedata = await jsongen(browseUrl);
  return browsedata.hentai_videos.map((x) => ({
    id: x.id,
    name: x.name,
    slug: x.slug,
    cover_url: x.cover_url,
    views: x.views,
    link: `/watch/${x.slug}`,
  }));
};