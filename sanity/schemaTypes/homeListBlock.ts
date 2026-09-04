export const homeListBlock = {
  name: "homeListBlock",
  title: "Bloco de lista da Home",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Título da lista",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "items",
      title: "Itens",
      description: "Adicione, remova ou reordene os itens deste bloco.",
      type: "array",
      of: [{ type: "homeListItem" }],
    },
  ],
  preview: {
    select: { title: "title" },
  },
};
