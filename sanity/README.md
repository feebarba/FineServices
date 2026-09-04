# Conteúdo do portfólio no Sanity

O front já está conectado ao Sanity em build time. Quando `PUBLIC_SANITY_PROJECT_ID` estiver configurado, a página consulta documentos `project` publicados; sem essa variável, o conteúdo local continua sendo usado como fallback.

## Configuração

1. Crie ou abra um projeto em [sanity.io/manage](https://www.sanity.io/manage) e copie o Project ID.
2. Duplique `.env.example` para `.env` e preencha `PUBLIC_SANITY_PROJECT_ID`. O dataset padrão é `production`.
3. Ao criar o Sanity Studio, registre os tipos exportados por `sanity/schemaTypes/index.ts`.
4. Publique documentos do tipo `project`.

Cada projeto pode ser exibido em `design`, `photography` ou nas duas abas. As galerias usam o objeto `media`, que aceita imagem ou vídeo, texto alternativo, orientação, paleta e dimensões originais. A URL dos assets é resolvida pelo GROQ no build, sem colocar tokens de escrita no navegador.

## Studio

Este repositório contém os schemas compartilhados, mas não um Studio isolado. Se o Studio estiver em outro diretório, importe `sanity/schemaTypes/index.ts` na configuração dele. O site só precisa das variáveis de leitura listadas em `.env.example`.
