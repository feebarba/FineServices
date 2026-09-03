import { createClient } from "@sanity/client";

export type Project = {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  description: string;
  outcome: string;
  cover?: string;
  theme: "orange" | "blue" | "lime";
};

const fallbackProjects: Project[] = [
  {
    title: "Norte",
    slug: "norte",
    category: "Identidade & produto",
    year: "2024",
    description: "Uma nova linguagem para uma marca que transforma dados em decisões.",
    outcome: "+42% de conversão no primeiro trimestre",
    theme: "orange",
  },
  {
    title: "Casa Hábito",
    slug: "casa-habito",
    category: "Direção criativa",
    year: "2023",
    description: "Sistema visual e digital para morar melhor, com menos ruído.",
    outcome: "Lançamento em 3 cidades",
    theme: "blue",
  },
  {
    title: "Mormaço",
    slug: "mormaco",
    category: "Estratégia & campanha",
    year: "2023",
    description: "Uma campanha de verão construída para ocupar a cidade inteira.",
    outcome: "1,8M de pessoas alcançadas",
    theme: "lime",
  },
];

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? "production";

const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION ?? "2025-01-01",
      useCdn: true,
    })
  : null;

export const sanityConfigured = Boolean(client);

export async function getProjects(): Promise<Project[]> {
  if (!client) return fallbackProjects;

  try {
    const projects = await client.fetch<Project[]>(
      `*[_type == "project"] | order(year desc) {
        _id,
        title,
        "slug": slug.current,
        category,
        year,
        description,
        outcome,
        cover,
        theme
      }`,
    );

    return projects.length > 0 ? projects : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}
