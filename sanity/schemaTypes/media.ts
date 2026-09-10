export const media = {
  name: "media",
  title: "Mídia de Design",
  type: "object",
  fields: [
    {
      name: "kind",
      title: "Tipo",
      type: "string",
      initialValue: "image",
      options: {
        list: [
          { title: "Imagem", value: "image" },
          { title: "Vídeo", value: "video" },
        ],
        layout: "radio",
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "image",
      title: "Imagem",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }: any) => parent?.kind !== "image",
    },
    {
      name: "video",
      title: "Vídeo MP4",
      type: "file",
      options: { accept: "video/mp4,.mp4" },
      hidden: ({ parent }: any) => parent?.kind !== "video",
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) => {
          if (context.parent?.kind !== "video") return true

          const assetReference = value?.asset?._ref
          if (!assetReference) return "Adicione um vídeo MP4."

          return assetReference.endsWith("-mp4")
            ? true
            : "Use um arquivo no formato MP4."
        }),
    },
    {
      name: "poster",
      title: "Poster do vídeo",
      description: "Quadro de capa gerado automaticamente pelo uploader.",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }: any) => parent?.kind !== "video",
    },
    {
      name: "alt",
      title: "Texto alternativo",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "orientation",
      title: "Orientação",
      type: "string",
      initialValue: "horizontal",
      options: {
        list: [
          { title: "Horizontal", value: "horizontal" },
          { title: "Vertical", value: "vertical" },
        ],
        layout: "radio",
      },
    },
    {
      name: "palette",
      title: "Paleta",
      type: "string",
      initialValue: "color",
      options: {
        list: [
          { title: "Colorida", value: "color" },
          { title: "Preto e branco", value: "black-and-white" },
        ],
        layout: "radio",
      },
    },
    {
      name: "width",
      title: "Largura original (px)",
      type: "number",
      validation: (Rule: any) => Rule.required().integer().min(1),
    },
    {
      name: "height",
      title: "Altura original (px)",
      type: "number",
      validation: (Rule: any) => Rule.required().integer().min(1),
    },
  ],
  preview: {
    select: { title: "alt", subtitle: "kind", media: "image" },
  },
};
