import { readFile, rm } from "node:fs/promises";

const distUrl = new URL("../dist/", import.meta.url);
const cmsRoutes = ["design/index.html", "photography/index.html"];

const generatedPages = await Promise.all(
  cmsRoutes.map((route) => readFile(new URL(route, distUrl), "utf8")),
);

const isUsingSanityMedia = generatedPages.every((page) => page.includes("cdn.sanity.io"));

if (!isUsingSanityMedia) {
  console.warn("Local fallback assets were kept because the generated pages are not using Sanity media.");
  process.exit(0);
}

for (const assetDirectory of ["images/projects", "videos/projects"]) {
  await rm(new URL(assetDirectory, distUrl), { force: true, recursive: true });
}

console.log("Removed local fallback media from the production dist.");
