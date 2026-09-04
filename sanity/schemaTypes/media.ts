export const media = {
  name: "media",
  title: "Mídia",
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
      title: "Vídeo",
      type: "file",
      options: { accept: "video/*" },
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
