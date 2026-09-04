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

export type PortfolioProject = {
  title: string;
  designType: string;
  info: string;
  credits: DesignCredit[];
  location: string;
  medium: string;
  year: string;
  photoCount: number;
  sections?: PortfolioSection[];
  photos?: ProjectPhoto[];
  designMedia?: ProjectMedia[];
};
