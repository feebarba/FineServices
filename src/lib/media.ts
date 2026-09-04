const SANITY_IMAGE_HOST = "cdn.sanity.io";

type ImageTransformOptions = {
  width?: number;
  quality?: number;
};

const isSanityImageUrl = (src: string) => {
  try {
    return new URL(src).hostname === SANITY_IMAGE_HOST;
  } catch {
    return false;
  }
};

/**
 * Applies Sanity's image CDN transforms while leaving local fallback assets
 * untouched. `auto=format` lets the browser negotiate WebP/AVIF when supported.
 */
export const getOptimizedImageUrl = (
  src: string,
  { width, quality = 82 }: ImageTransformOptions = {},
) => {
  if (!isSanityImageUrl(src)) return src;

  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("q", String(quality));

  if (width) {
    url.searchParams.set("w", String(Math.max(1, Math.round(width))));
  }

  return url.toString();
};

/**
 * Builds a compact responsive source set for Sanity images. The original
 * width is retained as the largest candidate so high-density displays do not
 * get an unnecessarily soft image.
 */
export const getImageSrcSet = (src: string, intrinsicWidth: number) => {
  if (!isSanityImageUrl(src) || intrinsicWidth <= 0) return undefined;

  const candidates = [320, 480, 640, 800, 1024, 1280, 1600, 1920, intrinsicWidth]
    .filter((width) => width < intrinsicWidth)
    .concat(intrinsicWidth)
    .filter((width, index, widths) => widths.indexOf(width) === index);

  return candidates
    .sort((a, b) => a - b)
    .map((width) => `${getOptimizedImageUrl(src, {width})} ${width}w`)
    .join(", ");
};
