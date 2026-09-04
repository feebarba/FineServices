export const project = {
  name: "project",
  title: "Projeto do portfólio",
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
      name: "sections",
      title: "Exibir na aba",
      type: "array",
      initialValue: ["design", "photography"],
      of: [
        {
          type: "string",
          options: {
            list: [
              { title: "Design", value: "design" },
              { title: "Photography", value: "photography" },
            ],
          },
        },
      ],
      validation: (Rule: any) => Rule.unique().min(1),
    },
    {
      name: "designType",
      title: "Tipo de projeto",
      type: "string",
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
      name: "location",
      title: "Local",
      type: "string",
    },
    {
      name: "medium",
      title: "Meio / filme",
      type: "string",
    },
    {
      name: "year",
      title: "Ano",
      type: "string",
    },
    {
      name: "photos",
      title: "Galeria de Photography",
      type: "array",
      of: [{ type: "media" }],
    },
    {
      name: "designMedia",
      title: "Mídias de Design",
      type: "array",
      of: [{ type: "media" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "designMedia.0.image",
    },
  },
};
