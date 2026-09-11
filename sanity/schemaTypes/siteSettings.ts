export const siteSettings = {
  name: "siteSettings",
  title: "Home",
  type: "document",
  fieldsets: [
    {
      name: "homeMedia",
      title: "Mídia da Home",
      options: { collapsible: true, collapsed: false },
    },
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
      name: "homeMediaEnabled",
      title: "Exibir mídia na Home",
      description: "Ative ou desative o bloco quadrado exibido entre o conteúdo e o contato.",
      type: "boolean",
      fieldset: "homeMedia",
      initialValue: true,
    },
    {
      name: "homeMediaType",
      title: "Tipo de mídia",
      type: "string",
      fieldset: "homeMedia",
      initialValue: "iframe",
      options: {
        list: [
          { title: "Link incorporado (iframe)", value: "iframe" },
          { title: "Imagem", value: "image" },
          { title: "Vídeo MP4", value: "video" },
        ],
        layout: "radio",
      },
      hidden: ({ document }: any) => document?.homeMediaEnabled === false,
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) =>
          context.document?.homeMediaEnabled === false || value
            ? true
            : "Escolha o tipo de mídia.",
        ),
    },
    {
      name: "homeMediaEmbedUrl",
      title: "Link do iframe",
      type: "url",
      fieldset: "homeMedia",
      initialValue: "https://watch-move.netlify.app/",
      hidden: ({ document }: any) =>
        document?.homeMediaEnabled === false || document?.homeMediaType !== "iframe",
      validation: (Rule: any) =>
        Rule.uri({ scheme: ["http", "https"] }).custom((value: any, context: any) =>
          context.document?.homeMediaEnabled === false ||
          context.document?.homeMediaType !== "iframe" ||
          value
            ? true
            : "Adicione o link que será incorporado.",
        ),
    },
    {
      name: "homeMediaImage",
      title: "Imagem",
      type: "image",
      fieldset: "homeMedia",
      options: { hotspot: true },
      hidden: ({ document }: any) =>
        document?.homeMediaEnabled === false || document?.homeMediaType !== "image",
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) =>
          context.document?.homeMediaEnabled === false ||
          context.document?.homeMediaType !== "image" ||
          value?.asset?._ref
            ? true
            : "Adicione uma imagem.",
        ),
    },
    {
      name: "homeMediaVideo",
      title: "Vídeo MP4",
      type: "file",
      fieldset: "homeMedia",
      options: { accept: "video/mp4,.mp4" },
      hidden: ({ document }: any) =>
        document?.homeMediaEnabled === false || document?.homeMediaType !== "video",
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) => {
          if (
            context.document?.homeMediaEnabled === false ||
            context.document?.homeMediaType !== "video"
          ) {
            return true;
          }

          const assetReference = value?.asset?._ref;
          if (!assetReference) return "Adicione um vídeo MP4.";

          return assetReference.endsWith("-mp4")
            ? true
            : "Use um arquivo no formato MP4.";
        }),
    },
    {
      name: "homeMediaDescription",
      title: "Descrição acessível",
      description: "Descreva brevemente a imagem, o vídeo ou o conteúdo incorporado.",
      type: "string",
      fieldset: "homeMedia",
      initialValue: "Relógio interativo",
      hidden: ({ document }: any) => document?.homeMediaEnabled === false,
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) =>
          context.document?.homeMediaEnabled === false || value
            ? true
            : "Adicione uma descrição acessível.",
        ),
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
