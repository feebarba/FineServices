# Felipe Barbosa — Sanity Studio

Este Studio está conectado ao projeto `btfiysbs`, no dataset `production`.

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
