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
      name: "practice",
      title: "Pratice",
      type: "array",
      of: [{ type: "homeListItem" }],
    },
    {
      name: "mentionsAwards",
      title: "Mentions & Awards",
      type: "array",
      of: [{ type: "homeListItem" }],
    },
  ],
  preview: {
    select: { title: "brand", subtitle: "_type" },
  },
};
