/**
 * Fetch a photo from Wikipedia's public summary API.
 * Returns the article's main thumbnail URL, or null if unavailable.
 * Results are cached by Next.js for 24 hours.
 */
export async function getWikipediaThumbnail(
  topic: string,
  minWidth = 400,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      thumbnail?: { source: string; width: number; height: number };
    };
    if (!data.thumbnail) return null;
    // Bump to a larger size by rewriting the width token in the URL
    const src = data.thumbnail.source;
    if (data.thumbnail.width < minWidth) return null;
    return src.replace(/\/\d+(px-[^/]+)$/, `/600$1`);
  } catch {
    return null;
  }
}
