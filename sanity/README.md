# Conteúdo do portfólio

O site já funciona com conteúdo local e passa a consumir projetos do Sanity assim que `PUBLIC_SANITY_PROJECT_ID` estiver configurado.

1. Crie um projeto no Sanity e copie o Project ID.
2. Defina `PUBLIC_SANITY_PROJECT_ID` e `PUBLIC_SANITY_DATASET` no ambiente do site.
3. Use `sanity/schemaTypes/index.ts` ao criar o Studio e publique documentos do tipo `project`.

O schema foi mantido pequeno para que textos e cases possam evoluir sem mudar a apresentação do portfólio.
