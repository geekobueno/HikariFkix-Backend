import { jsongen } from '../utils/jsongen.js';

export const getBrowse = async () => {
  const browseUrl = 'https://hanime.tv/api/v8/browse';
  return await jsongen(browseUrl);
};