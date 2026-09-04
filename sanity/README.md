# Conteúdo do portfólio no Sanity

O front já está conectado ao Sanity em build time. Quando `PUBLIC_SANITY_PROJECT_ID` estiver configurado, a página consulta os documentos independentes `designProject` e `photographyProject`; sem essa variável, o conteúdo local continua sendo usado como fallback.

## Configuração

1. Crie ou abra um projeto em [sanity.io/manage](https://www.sanity.io/manage) e copie o Project ID.
2. Duplique `.env.example` para `.env` e preencha `PUBLIC_SANITY_PROJECT_ID`. O dataset padrão é `production`.
3. O Studio conectado ao projeto está em `sanity/studio`; os tipos são registrados por `sanity/schemaTypes/index.ts`.
4. Edite `Configurações gerais` para alterar favicon, metadados e compartilhamento do site.
5. Edite o documento `Home` para alterar a apresentação e os blocos de listas da página inicial.
6. Publique documentos dos tipos `designProject` ou `photographyProject`.

Os projetos de Design e Photography são independentes. Design possui tipo, Info, créditos, ano e uma única galeria `gallery`, que aceita imagem ou vídeo. Photography possui local, meio/filme, ano e uma galeria `photos` somente de imagens. Não existe campo de seção compartilhado entre as abas. A Home possui a lista `lists`, formada por blocos com título editável e itens próprios; novos blocos podem ser adicionados no Studio. As configurações gerais públicas são resolvidas pelo GROQ no build; credenciais de SSO não são expostas no navegador.

## Studio

Este repositório contém os schemas compartilhados, mas não um Studio isolado. Se o Studio estiver em outro diretório, importe `sanity/schemaTypes/index.ts` na configuração dele. O site só precisa das variáveis de leitura listadas em `.env.example`.
