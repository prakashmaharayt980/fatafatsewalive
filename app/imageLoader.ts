const CDN_URL = 'https://img.fatafatsewa.com';

export default function myLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // 1. Handle absolute URLs (already on a CDN or external source)
  if (src.startsWith('http')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 75));
    return url.toString();
  }

  // 2. Handle data URLs or blobs (e.g. from signature pad)
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // 3. Handle internal Next.js assets
  if (src.startsWith('/_next/') || src.startsWith('static/')) {
    return src;
  }

  // 4. Handle relative paths (internal images redirected to CDN)
  const normalizedSrc = src.startsWith('/') ? src.slice(1) : src;
  return `${CDN_URL}/${normalizedSrc}?w=${width}&q=${quality ?? 75}`;
}