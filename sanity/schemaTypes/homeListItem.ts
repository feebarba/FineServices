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
  ],
  preview: {
    select: { title: "title", subtitle: "detail" },
  },
};
