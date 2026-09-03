export const project = {
  name: "project",
  title: "Projeto",
  type: "document",
  fields: [
    { name: "title", title: "Título", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "category", title: "Categoria", type: "string" },
    { name: "year", title: "Ano", type: "string" },
    { name: "description", title: "Descrição", type: "text", rows: 3 },
    { name: "outcome", title: "Resultado", type: "string" },
    { name: "cover", title: "URL da capa", type: "url" },
    {
      name: "theme",
      title: "Tema visual",
      type: "string",
      options: { list: ["orange", "blue", "lime"] },
    },
  ],
};
