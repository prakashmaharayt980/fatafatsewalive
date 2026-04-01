// imageLoader.js



export default function myLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('http')) return `${src}?w=${width}&q=${quality ?? 75}`;
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 75));
  return url.toString();
}