import { createClient } from "@sanity/client";
import type {
  DesignCredit,
  PhotoOrientation,
  PhotoPalette,
  HomeListBlock,
  PortfolioHome,
  PortfolioProject,
  PortfolioSection,
  ProjectMedia,
} from "./portfolio-types";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.PUBLIC_SANITY_DATASET?.trim() || "production";

const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION ?? "2025-01-01",
      useCdn: true,
    })
  : null;

export const sanityConfigured = Boolean(client);

type RawMedia = {
  kind?: "image" | "video";
  src?: string;
  assetWidth?: number;
  assetHeight?: number;
  alt?: string;
  orientation?: PhotoOrientation;
  palette?: PhotoPalette;
  width?: number;
  height?: number;
};

type RawProject = {
  section?: PortfolioSection;
  title?: string;
  designType?: string;
  info?: string;
  credits?: DesignCredit[];
  location?: string;
  medium?: string;
  year?: string | number;
  photoCount?: number;
  photos?: RawMedia[];
  gallery?: RawMedia[];
};

type RawHome = {
  brand?: string;
  intro?: string[];
  lists?: Array<{
    title?: string;
    items?: Array<{ title?: string; detail?: string }>;
  }>;
};

const MEDIA_PROJECTION = `{
  kind,
  alt,
  orientation,
  palette,
  width,
  height,
  "src": select(kind == "video" => video.asset->url, image.asset->url),
  "assetWidth": select(kind == "video" => video.asset->metadata.dimensions.width, image.asset->metadata.dimensions.width),
  "assetHeight": select(kind == "video" => video.asset->metadata.dimensions.height, image.asset->metadata.dimensions.height)
}`;

const PORTFOLIO_DESIGN_QUERY = `
  *[_type == "designProject" && defined(title)] | order(coalesce(order, 9999) asc, year desc) {
    "section": "design",
    title,
    designType,
    info,
    credits[]{category, name},
    year,
    "gallery": gallery[]${MEDIA_PROJECTION}
  }
`;

const PORTFOLIO_PHOTOGRAPHY_QUERY = `
  *[_type == "photographyProject" && defined(title)] | order(coalesce(order, 9999) asc, year desc) {
    "section": "photography",
    title,
    location,
    medium,
    year,
    "photoCount": count(photos),
    "photos": photos[]{
      alt,
      orientation,
      palette,
      width,
      height,
      "src": image.asset->url,
      "assetWidth": image.asset->metadata.dimensions.width,
      "assetHeight": image.asset->metadata.dimensions.height
    }
  }
`;

const PORTFOLIO_HOME_QUERY = `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    brand,
    intro,
    lists[]{
      title,
      items[]{title, detail}
    }
  }
`;

const normalizeMedia = (media: RawMedia): ProjectMedia | null => {
  if (!media.src) return null;

  const width = media.width || media.assetWidth || 1;
  const height = media.height || media.assetHeight || 1;
  const orientation = media.orientation ?? (width >= height ? "horizontal" : "vertical");
  const baseMedia = {
    src: media.src,
    alt: media.alt ?? "",
    orientation,
    width,
    height,
  };

  if (media.kind === "video") {
    return { kind: "video", ...baseMedia };
  }

  return {
    kind: "image",
    palette: media.palette ?? "color",
    ...baseMedia,
  };
};

const normalizeProject = (project: RawProject): PortfolioProject => {
  const photos = project.photos?.map(normalizeMedia).filter(Boolean) as PortfolioProject["photos"];
  const designMedia = project.gallery
    ?.map(normalizeMedia)
    .filter(Boolean) as PortfolioProject["designMedia"];

  return {
    section: project.section,
    title: project.title ?? "Untitled project",
    designType: project.designType,
    info: project.info,
    credits: project.credits,
    location: project.location,
    medium: project.medium,
    year: String(project.year ?? ""),
    photoCount: project.photoCount ?? photos?.length ?? 0,
    photos: photos?.length ? photos : undefined,
    designMedia: designMedia?.length ? designMedia : undefined,
  };
};

const normalizeHome = (home: RawHome): PortfolioHome => ({
  brand: home.brand ?? "FELIPE BARBOSA",
  intro: home.intro?.filter(Boolean) ?? [],
  lists: home.lists
    ?.filter((list) => list.title)
    .map((list): HomeListBlock => ({
      title: list.title!,
      items:
        list.items
          ?.filter((item) => item.title && item.detail)
          .map((item) => ({ title: item.title!, detail: item.detail! })) ?? [],
    })) ?? [],
});

/**
 * Fetches published portfolio content at build time.
 * Returns null when the CMS is not configured or has no usable documents so
 * the site can keep its local content while the Sanity project is being set up.
 */
export async function getPortfolioProjects(): Promise<PortfolioProject[] | null> {
  if (!client) return null;

  try {
    const [designProjects, photographyProjects] = await Promise.all([
      client.fetch<RawProject[]>(PORTFOLIO_DESIGN_QUERY),
      client.fetch<RawProject[]>(PORTFOLIO_PHOTOGRAPHY_QUERY),
    ]);
    const projects = [...designProjects, ...photographyProjects];
    if (!projects.length) return null;
    return projects.map(normalizeProject);
  } catch {
    return null;
  }
}

/** Fetches the editable Home content at build time. */
export async function getPortfolioHome(): Promise<PortfolioHome | null> {
  if (!client) return null;

  try {
    const home = await client.fetch<RawHome | null>(PORTFOLIO_HOME_QUERY);
    if (!home) return null;
    return normalizeHome(home);
  } catch {
    return null;
  }
}
