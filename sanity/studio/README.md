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

- `Design`: mostra documentos do tipo `designProject`.
- `Photography`: mostra documentos do tipo `photographyProject`.

Os projetos são independentes e não possuem o campo `Exibir na aba`. Projetos de Design têm uma única `Galeria de Design`, com imagens ou vídeos, além de tipo, Info, créditos e ano. Projetos de Photography têm `Galeria de Photography`, somente com imagens, além de local, meio/filme e ano.

As duas galerias têm um botão de upload múltiplo. Selecione vários arquivos na mesma janela para adicioná-los de uma vez; o nome do arquivo é usado como texto alternativo inicial e cada item pode ser aberto depois para ajustar alt, orientação, paleta e dimensões.

## Migração inicial

Para reimportar o conteúdo atual do layout no projeto `btfiysbs`:

```bash
cd /Users/felipebarbosa/Documents/Codex/2026-08-03/ol
PATH=/Users/felipebarbosa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node sanity/scripts/migrate-portfolio.mjs
```

O script é idempotente para os documentos e reutiliza assets já encontrados pelo nome original do arquivo.
