import type {StructureResolver} from 'sanity/structure'

const projectList = (S: any, id: string, title: string, section: 'design' | 'photography') =>
  S.documentList()
    .id(id)
    .title(title)
    .schemaType('project')
    .filter('_type == "project" && $section in sections')
    .params({section})
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
        .child(projectList(S, 'design-projects', 'Projetos de Design', 'design')),
      S.listItem()
        .title('Photography')
        .child(projectList(S, 'photography-projects', 'Projetos de Photography', 'photography')),
      S.divider(),
      S.documentTypeListItem('project').title('Todos os projetos'),
    ])
