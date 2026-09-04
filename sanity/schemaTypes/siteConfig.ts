export const siteConfig = {
  name: "siteConfig",
  title: "Configurações gerais",
  type: "document",
  fields: [
    {
      name: "siteTitle",
      title: "Título do site",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "siteDescription",
      title: "Descrição padrão",
      type: "text",
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "favicon",
      title: "Favicon",
      description: "Envie um PNG, SVG ou ICO para o ícone da aba do navegador.",
      type: "image",
    },
    {
      name: "shareTitle",
      title: "Título de compartilhamento",
      description: "Título usado ao compartilhar o site em redes sociais e mensageiros.",
      type: "string",
    },
    {
      name: "shareDescription",
      title: "Texto de compartilhamento",
      description: "Descrição exibida nos cartões de compartilhamento.",
      type: "text",
      rows: 3,
    },
    {
      name: "shareImage",
      title: "Imagem de compartilhamento",
      description: "Imagem usada nos cartões de compartilhamento do site.",
      type: "image",
    },
    {
      name: "canonicalUrl",
      title: "URL canônica",
      description: "Opcional. Use a URL pública principal do site, começando por https://.",
      type: "url",
      validation: (Rule: any) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    },
    {
      name: "themeColor",
      title: "Cor do navegador",
      description: "Opcional. Exemplo: #E7FDDB.",
      type: "string",
    },
    {
      name: "sso",
      title: "SSO",
      description: "Configuração pública do provedor. Nunca armazene client secrets neste documento.",
      type: "object",
      fields: [
        {
          name: "enabled",
          title: "SSO habilitado",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "provider",
          title: "Provedor",
          type: "string",
          options: {
            list: [
              { title: "OpenID Connect", value: "oidc" },
              { title: "SAML", value: "saml" },
            ],
          },
        },
        {
          name: "issuerUrl",
          title: "URL do issuer",
          description: "URL pública do provedor de identidade.",
          type: "url",
          validation: (Rule: any) =>
            Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
        },
        {
          name: "clientId",
          title: "Client ID público",
          type: "string",
        },
      ],
    },
  ],
  preview: {
    select: { title: "siteTitle", subtitle: "siteDescription" },
  },
};
