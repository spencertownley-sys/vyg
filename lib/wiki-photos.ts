/**
 * Fetch a photo from Wikipedia's public summary API.
 * Returns the article's main thumbnail URL, or null if unavailable.
 * Results are cached by Next.js for 24 hours.
 */
export async function getWikipediaThumbnail(topic: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      thumbnail?: { source: string };
    };
    if (!data.thumbnail?.source) return null;
    // Skip SVG thumbnails (flags, logos, maps)
    if (data.thumbnail.source.endsWith(".svg.png") || data.thumbnail.source.includes(".svg/")) {
      return null;
    }
    // Upscale to 600px by rewriting the width segment in the Wikimedia thumb URL
    return data.thumbnail.source.replace(/\/\d+(px-[^/]+)$/, "/600$1");
  } catch {
    return null;
  }
}
