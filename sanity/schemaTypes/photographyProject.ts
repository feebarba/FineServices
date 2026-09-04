import {BulkPhotographyMediaInput} from '../studio/components/BulkMediaArrayInput'

export const photographyProject = {
  name: "photographyProject",
  title: "Projeto de Photography",
  type: "document",
  fields: [
    {
      name: "order",
      title: "Ordem de exibição",
      type: "number",
      validation: (Rule: any) => Rule.integer().min(0),
    },
    {
      name: "title",
      title: "Nome do projeto",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    {
      name: "location",
      title: "Local",
      type: "string",
    },
    {
      name: "medium",
      title: "Meio / filme",
      type: "string",
    },
    {
      name: "year",
      title: "Ano",
      type: "string",
    },
    {
      name: "photos",
      title: "Galeria de Photography",
      type: "array",
      of: [{ type: "photoMedia" }],
      components: {input: BulkPhotographyMediaInput},
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "year",
      media: "photos.0.image",
    },
  },
};
