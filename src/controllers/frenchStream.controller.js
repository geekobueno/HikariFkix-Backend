import frenchStreamExtractor from '../extractors/frenchStream.extractor.js';

export async function getStreamingUrl(req, res) {
  const { showUrl} = req.query.url;
  const {episodeNumber} = req.query.ep;

  try {
    const VO = await frenchStreamExtractor.extractVO(showUrl, episodeNumber);
    const VF = await frenchStreamExtractor.extractVF(showUrl, episodeNumber);
    res.json({ success: true, VO, VF });
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    res.status(500).json({ success: false, error: 'Failed to get streaming URL' });
  }
}