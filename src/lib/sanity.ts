import { createClient } from "@sanity/client";
import type {
  DesignCredit,
  PhotoOrientation,
  PhotoPalette,
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
  title?: string;
  sections?: PortfolioSection[];
  designType?: string;
  info?: string;
  credits?: DesignCredit[];
  location?: string;
  medium?: string;
  year?: string | number;
  photoCount?: number;
  photos?: RawMedia[];
  designMedia?: RawMedia[];
};

const PORTFOLIO_PROJECTS_QUERY = `
  *[_type == "project" && defined(title)] | order(coalesce(order, 9999) asc, year desc) {
    title,
    sections,
    designType,
    info,
    credits[]{category, name},
    location,
    medium,
    year,
    "photoCount": count(photos),
    "photos": photos[]{
      kind,
      alt,
      orientation,
      palette,
      width,
      height,
      "src": select(kind == "video" => video.asset->url, image.asset->url),
      "assetWidth": select(kind == "video" => video.asset->metadata.dimensions.width, image.asset->metadata.dimensions.width),
      "assetHeight": select(kind == "video" => video.asset->metadata.dimensions.height, image.asset->metadata.dimensions.height)
    },
    "designMedia": designMedia[]{
      kind,
      alt,
      orientation,
      palette,
      width,
      height,
      "src": select(kind == "video" => video.asset->url, image.asset->url),
      "assetWidth": select(kind == "video" => video.asset->metadata.dimensions.width, image.asset->metadata.dimensions.width),
      "assetHeight": select(kind == "video" => video.asset->metadata.dimensions.height, image.asset->metadata.dimensions.height)
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
  const designMedia = project.designMedia
    ?.map(normalizeMedia)
    .filter(Boolean) as PortfolioProject["designMedia"];

  return {
    title: project.title ?? "Untitled project",
    designType: project.designType ?? "",
    info: project.info ?? "",
    credits: project.credits ?? [],
    location: project.location ?? "",
    medium: project.medium ?? "",
    year: String(project.year ?? ""),
    photoCount: project.photoCount ?? photos?.length ?? 0,
    sections: project.sections,
    photos: photos?.length ? photos : undefined,
    designMedia: designMedia?.length ? designMedia : undefined,
  };
};

/**
 * Fetches published portfolio content at build time.
 * Returns null when the CMS is not configured or has no usable documents so
 * the site can keep its local content while the Sanity project is being set up.
 */
export async function getPortfolioProjects(): Promise<PortfolioProject[] | null> {
  if (!client) return null;

  try {
    const projects = await client.fetch<RawProject[]>(PORTFOLIO_PROJECTS_QUERY);
    if (!projects.length) return null;
    return projects.map(normalizeProject);
  } catch {
    return null;
  }
}
