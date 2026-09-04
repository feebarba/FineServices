# Fine Services

Portfólio de design e fotografia de Felipe Barbosa, construído com Astro e
conteúdo editorial gerenciado no Sanity.

## Estrutura

- `src/`: páginas, componentes de conteúdo e estilos do site.
- `public/`: fontes, ícones e mídia local usada como fallback.
- `sanity/`: schemas, migração de conteúdo e o Studio do Sanity.
- `.fine-services/hosting.json`: configurações locais opcionais do projeto.
- `netlify.toml`: configuração de build e variáveis públicas do deploy.

Design e Photography são coleções independentes no CMS. A Home possui a
introdução e blocos de listas editáveis; as configurações gerais controlam
favicon, metadados e informações de compartilhamento.

Imagens publicadas no Sanity usam o CDN responsivo com negociação automática
de formato e qualidade. Vídeos só entram no DOM quando a galeria chega ao
viewport e recebem um poster JPEG leve gerado pelo uploader.

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
pnpm install
pnpm dev
pnpm build
```

Para consultar o conteúdo do Sanity, copie `.env.example` para `.env` e
configure `PUBLIC_SANITY_PROJECT_ID` e `PUBLIC_SANITY_DATASET`. Sem essas
variáveis, o site usa o conteúdo local de fallback.

O Studio fica em `sanity/studio`:

```bash
cd sanity/studio
pnpm install
pnpm dev
```

## Deploy

O repositório está conectado ao Netlify. Cada push na branch `main` executa
`pnpm build` e publica a pasta `dist/`. A atualização do conteúdo publicado no
Sanity dispara um novo deploy por meio do webhook configurado no projeto.
