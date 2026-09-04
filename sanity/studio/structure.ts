import type {StructureResolver} from 'sanity/structure'

const projectList = (
  S: any,
  id: string,
  title: string,
  schemaType: 'designProject' | 'photographyProject',
) =>
  S.documentList()
    .id(id)
    .title(title)
    .schemaType(schemaType)
    .filter(`_type == "${schemaType}"`)
    .defaultOrdering([
      {field: 'order', direction: 'asc'},
      {field: 'year', direction: 'desc'},
    ])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Portfólio')
    .items([
      S.listItem()
        .title('Home')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.listItem()
        .title('Design')
        .child(projectList(S, 'design-projects', 'Projetos de Design', 'designProject')),
      S.listItem()
        .title('Photography')
        .child(
          projectList(
            S,
            'photography-projects',
            'Projetos de Photography',
            'photographyProject',
          ),
        ),
    ])
