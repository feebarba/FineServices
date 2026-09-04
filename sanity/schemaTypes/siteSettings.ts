export const siteSettings = {
  name: "siteSettings",
  title: "Home",
  type: "document",
  fields: [
    {
      name: "brand",
      title: "Nome exibido",
      type: "string",
      initialValue: "FELIPE BARBOSA",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "intro",
      title: "Apresentação",
      description: "Cada item corresponde a um parágrafo da introdução.",
      type: "array",
      of: [{ type: "text", rows: 5 }],
      validation: (Rule: any) => Rule.min(1),
    },
    {
      name: "lists",
      title: "Blocos de listas",
      description: "Edite os títulos e adicione quantos blocos de lista quiser.",
      type: "array",
      of: [{ type: "homeListBlock" }],
      validation: (Rule: any) => Rule.min(1),
    },
  ],
  preview: {
    select: { title: "brand", subtitle: "_type" },
  },
};
