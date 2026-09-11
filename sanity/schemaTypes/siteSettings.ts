export const siteSettings = {
  name: "siteSettings",
  title: "Home",
  type: "document",
  fieldsets: [
    {
      name: "contact",
      title: "Contato",
      options: { collapsible: true, collapsed: false },
    },
  ],
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
    {
      name: "contactCta",
      title: "CTA Say hi!",
      description: "Texto exibido acima do e-mail no componente de contato.",
      type: "string",
      fieldset: "contact",
      initialValue: "Say hi!",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "contactEmail",
      title: "E-mail",
      type: "string",
      fieldset: "contact",
      initialValue: "Hello@felipebarbosa.work",
      validation: (Rule: any) => Rule.required().email(),
    },
    {
      name: "contactLinkedinUrl",
      title: "Link do LinkedIn",
      type: "url",
      fieldset: "contact",
      validation: (Rule: any) => Rule.uri({ scheme: ["http", "https"] }),
    },
    {
      name: "contactInstagramUrl",
      title: "Link do Instagram",
      type: "url",
      fieldset: "contact",
      validation: (Rule: any) => Rule.uri({ scheme: ["http", "https"] }),
    },
  ],
  preview: {
    select: { title: "brand", subtitle: "_type" },
  },
};
