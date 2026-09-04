export const designProject = {
  name: "designProject",
  title: "Projeto de Design",
  type: "document",
  fields: [
    {
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      validation: (Rule: any) => Rule.integer().min(0),
    },
    {
      name: "title",
      title: "Nome do projeto",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    {
      name: "designType",
      title: "Tipo de projeto",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "info",
      title: "Info",
      type: "text",
      rows: 5,
    },
    {
      name: "credits",
      title: "Créditos",
      type: "array",
      of: [{ type: "credit" }],
    },
    {
      name: "year",
      title: "Ano",
      type: "string",
    },
    {
      name: "gallery",
      title: "Galeria de Design",
      type: "array",
      of: [{ type: "media" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "gallery.0.image",
    },
  },
};
