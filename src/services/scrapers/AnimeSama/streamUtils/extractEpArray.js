export function extractEpisodeArrays(content) {
  try {
    const eps1Match = content.match(/var\s+eps1\s*=\s*(\[.*?\]);/s);
    const eps2Match = content.match(/var\s+eps2\s*=\s*(\[.*?\]);/s);

    if (!eps1Match && !eps2Match) {
      throw new Error("No episode data found");
    }

    const eps1 = eps1Match ? eps1Match[1] : "[]";
    const eps2 = eps2Match ? eps2Match[1] : "[]";

    return { eps1, eps2 };
  } catch (error) {
    throw new Error(`Failed to extract episode data: ${error.message}`);
  }
}
