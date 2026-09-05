import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

const projectList = (
  S: any,
  context: any,
  id: string,
  title: string,
  schemaType: 'designProject' | 'photographyProject',
) =>
  orderableDocumentListDeskItem({
    S,
    context,
    id,
    title,
    type: schemaType,
  })

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Portfólio')
    .items([
      S.listItem()
        .title('Configurações gerais')
        .child(S.document().schemaType('siteConfig').documentId('siteConfig')),
      S.divider(),
      S.listItem()
        .title('Home')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      projectList(S, context, 'design-projects', 'Projetos de Design', 'designProject'),
      projectList(
        S,
        context,
        'photography-projects',
        'Projetos de Photography',
        'photographyProject',
      ),
    ])
