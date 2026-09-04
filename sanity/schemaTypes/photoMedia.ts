export const photoMedia = {
  name: "photoMedia",
  title: "Imagem de Photography",
  type: "object",
  fields: [
    {
      name: "image",
      title: "Imagem",
      type: "image",
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
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
    select: { title: "alt", subtitle: "orientation", media: "image" },
  },
};
