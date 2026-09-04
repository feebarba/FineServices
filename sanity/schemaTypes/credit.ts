export const credit = {
  name: "credit",
  title: "Crédito",
  type: "object",
  fields: [
    { name: "category", title: "Categoria", type: "string" },
    { name: "name", title: "Nome", type: "string" },
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
};
