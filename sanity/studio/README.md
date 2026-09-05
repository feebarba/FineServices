# Felipe Barbosa — Sanity Studio

Este Studio está conectado ao projeto `btfiysbs`, no dataset `production`.

O Studio publicado está disponível em [fine-services.sanity.studio](https://fine-services.sanity.studio/).

## Comandos

```bash
cd sanity/studio
pnpm dev
```

Para gerar a versão publicada do Studio:

```bash
pnpm build
pnpm deploy
```

Os schemas usados pelo Studio vêm de `sanity/schemaTypes/index.ts`, que é compartilhado com o front do portfólio. Consulte o [guia do Sanity](https://www.sanity.io/docs/introduction/getting-started) para mais detalhes sobre o Content Studio.

## Organização do conteúdo

O Structure Tool apresenta duas entradas independentes:

- `Configurações gerais`: favicon, título e descrição padrão, metadados de compartilhamento, URL canônica, cor do navegador e configuração pública de SSO.
- `Design`: mostra documentos do tipo `designProject`.
- `Photography`: mostra documentos do tipo `photographyProject`.

Os projetos são independentes e não possuem o campo `Exibir na aba`. Projetos de Design têm uma única `Galeria de Design`, com imagens ou vídeos, além de tipo, Info, créditos e ano. Projetos de Photography têm `Galeria de Photography`, somente com imagens, além de local, meio/filme e ano.

As listas `Design` e `Photography` usam ordenação por arrastar e soltar. O campo técnico `orderRank` fica oculto no editor; basta arrastar um projeto para a posição desejada. Projetos novos entram no topo por padrão.

`Home` concentra a apresentação, os blocos de listas da página inicial e o toggle `Animar nome da marca`. Cada bloco tem um título editável e sua própria lista de itens; use `Adicionar item` para criar novos blocos além de `Pratice` e `Mentions & Awards`, ou edite esses títulos diretamente.

As duas galerias têm apenas o botão de upload múltiplo. Selecione vários arquivos na mesma janela para adicioná-los de uma vez; o nome do arquivo é usado como texto alternativo inicial e cada item pode ser aberto depois para ajustar alt, orientação, paleta e dimensões.

Para vídeos, o uploader também lê `videoWidth` e `videoHeight` antes de salvar
o item e gera automaticamente um poster JPEG de até 1280 px. O vídeo original
continua preservado; compressão/transcodificação completa requer um pipeline
próprio de vídeo.

Cada item das listas da Home também possui um campo opcional de `Link externo`, validado para URLs `http` e `https`.

## Migração inicial

Para reimportar o conteúdo atual do layout no projeto `btfiysbs`:

```bash
cd /Users/felipebarbosa/Documents/Codex/2026-08-03/ol
PATH=/Users/felipebarbosa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node sanity/scripts/migrate-portfolio.mjs
```

O script é idempotente para os documentos e reutiliza assets já encontrados pelo nome original do arquivo.

## Migração da ordem atual

O campo numérico legado `order` foi removido do editor. Para preservar a ordem atual dos projetos existentes, faça primeiro um dry run no Studio:

```bash
cd sanity/studio
pnpm migrations:seed-order:dry
```

Revise o resultado e, se estiver correto, aplique a migração:

```bash
pnpm migrations:seed-order
```

Essa migração converte a ordem numérica atual para `orderRank` e remove o campo legado `order`. Ela é uma operação de conteúdo no dataset; faça backup antes de executá-la. Depois disso, a ordenação pode ser mantida diretamente por drag-and-drop.
