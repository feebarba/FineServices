export type PhotoOrientation = "horizontal" | "vertical";
export type PhotoPalette = "black-and-white" | "color";
export type PortfolioSection = "design" | "photography";

export type ProjectPhoto = {
  kind?: "image";
  src: string;
  alt: string;
  orientation: PhotoOrientation;
  palette: PhotoPalette;
  width: number;
  height: number;
};

export type ProjectVideo = {
  kind: "video";
  src: string;
  alt: string;
  orientation: PhotoOrientation;
  width: number;
  height: number;
};

export type ProjectMedia = ProjectPhoto | ProjectVideo;

export type DesignCredit = {
  category: string;
  name: string;
};

export type HomeListItem = {
  title: string;
  detail: string;
};

export type HomeListBlock = {
  title: string;
  items: HomeListItem[];
};

export type PortfolioHome = {
  brand: string;
  intro: string[];
  lists: HomeListBlock[];
};

export type PortfolioProject = {
  title: string;
  section?: PortfolioSection;
  designType?: string;
  info?: string;
  credits?: DesignCredit[];
  location?: string;
  medium?: string;
  year: string;
  photoCount: number;
  photos?: ProjectPhoto[];
  designMedia?: ProjectMedia[];
};
