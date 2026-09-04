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
      name: "brandAnimation",
      title: "Animar nome da marca",
      description:
        "Ative para alternar entre o nome cadastrado e Fine Services com efeito de typewriting.",
      type: "boolean",
      initialValue: false,
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
