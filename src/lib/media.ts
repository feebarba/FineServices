const SANITY_IMAGE_HOST = "cdn.sanity.io";
const MAX_RESPONSIVE_IMAGE_WIDTH = 2560;

type ImageTransformOptions = {
  width?: number;
  quality?: number;
  blur?: number;
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
  { width, quality = 82, blur }: ImageTransformOptions = {},
) => {
  if (!isSanityImageUrl(src)) return src;

  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("q", String(quality));

  if (width) {
    url.searchParams.set("w", String(Math.max(1, Math.round(width))));
  }

  if (blur) {
    url.searchParams.set("blur", String(Math.max(0, Math.round(blur))));
  }

  return url.toString();
};

/**
 * Returns a tiny blurred Sanity image used while the final media is loading.
 * Local fallback assets intentionally return undefined so they are not
 * downloaded twice during local development.
 */
export const getLowQualityImageUrl = (src: string) => {
  if (!isSanityImageUrl(src)) return undefined;

  return getOptimizedImageUrl(src, {
    width: 48,
    quality: 35,
    blur: 12,
  });
};

/**
 * Builds a compact responsive source set for Sanity images. Large originals
 * stay available in Sanity, but delivery is capped to avoid excessive decode
 * memory on high-density and 4K displays.
 */
export const getImageSrcSet = (src: string, intrinsicWidth: number) => {
  if (!isSanityImageUrl(src) || intrinsicWidth <= 0) return undefined;

  const maximumWidth = Math.min(intrinsicWidth, MAX_RESPONSIVE_IMAGE_WIDTH);
  const candidates = [320, 480, 640, 800, 1024, 1280, 1600, 1920, maximumWidth]
    .filter((width) => width < maximumWidth)
    .concat(maximumWidth)
    .filter((width, index, widths) => widths.indexOf(width) === index);

  return candidates
    .sort((a, b) => a - b)
    .map((width) => `${getOptimizedImageUrl(src, {width})} ${width}w`)
    .join(", ");
};
