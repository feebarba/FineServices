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
      name: "homeMediaRandomize",
      title: "Randomizar mídia a cada carregamento",
      description:
        "Quando desativado, o primeiro item da lista será exibido. Quando ativado, a mídia muda a cada carregamento sem repetir consecutivamente na mesma sessão.",
      type: "boolean",
      fieldset: "homeMedia",
      initialValue: false,
      hidden: ({ document }: any) => document?.homeMediaEnabled === false,
    },
    {
      name: "homeMediaItems",
      title: "Mídias",
      description: "Adicione e ordene até quatro opções de mídia para o bloco da Home.",
      type: "array",
      fieldset: "homeMedia",
      hidden: ({ document }: any) => document?.homeMediaEnabled === false,
      of: [
        {
          name: "homeMediaItem",
          title: "Mídia da Home",
          type: "object",
          fields: [
            {
              name: "type",
              title: "Tipo de mídia",
              type: "string",
              initialValue: "iframe",
              options: {
                list: [
                  { title: "Link incorporado (iframe)", value: "iframe" },
                  { title: "Imagem", value: "image" },
                  { title: "Vídeo MP4", value: "video" },
                ],
                layout: "radio",
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "embedUrl",
              title: "Link do iframe",
              type: "url",
              hidden: ({ parent }: any) => parent?.type !== "iframe",
              validation: (Rule: any) => Rule.uri({ scheme: ["http", "https"] }),
            },
            {
              name: "image",
              title: "Imagem",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }: any) => parent?.type !== "image",
            },
            {
              name: "video",
              title: "Vídeo MP4",
              type: "file",
              options: { accept: "video/mp4,.mp4" },
              hidden: ({ parent }: any) => parent?.type !== "video",
            },
            {
              name: "description",
              title: "Descrição acessível",
              description: "Descreva brevemente a imagem, o vídeo ou o conteúdo incorporado.",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
          ],
          validation: (Rule: any) =>
            Rule.custom((item: any) => {
              if (!item?.type) return "Escolha o tipo de mídia.";
              if (item.type === "iframe" && !item.embedUrl) return "Adicione o link do iframe.";
              if (item.type === "image" && !item.image?.asset?._ref) return "Adicione uma imagem.";
              if (item.type === "video") {
                const assetReference = item.video?.asset?._ref;
                if (!assetReference) return "Adicione um vídeo MP4.";
                if (!assetReference.endsWith("-mp4")) return "Use um arquivo no formato MP4.";
              }
              return true;
            }),
          preview: {
            select: {
              type: "type",
              description: "description",
              media: "image",
            },
            prepare({ type, description, media }: any) {
              const labels: Record<string, string> = {
                iframe: "Iframe",
                image: "Imagem",
                video: "Vídeo MP4",
              };
              return {
                title: description || "Mídia sem descrição",
                subtitle: labels[type] || "Escolha o tipo",
                media,
              };
            },
          },
        },
      ],
      validation: (Rule: any) =>
        Rule.max(4).custom((items: any[] | undefined, context: any) => {
          const document = context.document;
          const hasLegacyMedia = Boolean(
            document?.homeMediaEmbedUrl ||
              document?.homeMediaImage?.asset?._ref ||
              document?.homeMediaVideo?.asset?._ref,
          );
          return document?.homeMediaEnabled === false || items?.length || hasLegacyMedia
            ? true
            : "Adicione ao menos uma mídia.";
        }),
    },
    // Campos legados mantidos ocultos para preservar documentos já publicados.
    {
      name: "homeMediaType",
      title: "Tipo de mídia legado",
      type: "string",
      fieldset: "homeMedia",
      hidden: true,
    },
    {
      name: "homeMediaEmbedUrl",
      title: "Link do iframe legado",
      type: "url",
      fieldset: "homeMedia",
      hidden: true,
    },
    {
      name: "homeMediaImage",
      title: "Imagem legada",
      type: "image",
      fieldset: "homeMedia",
      options: { hotspot: true },
      hidden: true,
    },
    {
      name: "homeMediaVideo",
      title: "Vídeo MP4 legado",
      type: "file",
      fieldset: "homeMedia",
      options: { accept: "video/mp4,.mp4" },
      hidden: true,
    },
    {
      name: "homeMediaDescription",
      title: "Descrição acessível legada",
      type: "string",
      fieldset: "homeMedia",
      hidden: true,
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
