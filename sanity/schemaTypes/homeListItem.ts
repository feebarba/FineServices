export const homeListItem = {
  name: "homeListItem",
  title: "Item da lista da Home",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "detail",
      title: "Detalhe",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "link",
      title: "Link externo",
      description: "Opcional. Use uma URL completa, começando por https://.",
      type: "url",
      validation: (Rule: any) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    },
  ],
  preview: {
    select: { title: "title", subtitle: "detail" },
  },
};
