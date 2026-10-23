# Comfort Nomad

> **Sinta-se em casa, antes mesmo de chegar.**

Comfort Nomad ajuda expatriados, nômades digitais e viajantes a antecipar como pode ser viver em uma cidade. Esta versão do frontend usa dados fictícios e regras determinísticas; não representa aconselhamento migratório, financeiro ou de segurança.

## Rodar o frontend

Requisitos: Node.js 20+ e pnpm.

```bash
pnpm install
pnpm --filter web dev
```

O web funciona sem internet e sem iniciar `apps/api`. Para verificar o frontend:

```bash
pnpm --filter web typecheck
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test
```

O estado de conta, perfil anônimo, favoritos, comparação, checklist, contribuições e contatos fica no `localStorage` deste navegador. Senhas de demonstração são armazenadas localmente; use apenas dados fictícios.

## Estrutura do web

```text
apps/web/src/
  services/             contratos e fachada ativa
    types.ts            contratos de domínio
    index.ts            seleção da implementação ativa
    mock/               seed, armazenamento e serviços locais
  store/                estado global Zustand
  features/             onboarding, busca, resultados e páginas locais
  lib/i18n/             traduções da interface
```

Os dados de demonstração cobrem 15 destinos e seus resumos, clima mensal, opções de comida, bairros e dicas culturais. Valores de custo, segurança, recomendações, parceiros e conteúdo de comunidade são ilustrativos. Parceiros não abrem links comerciais.

## Dados reais no futuro

As telas devem chamar contratos em `services/`, nunca importar os seeds. Para uma futura fonte real:

1. Crie implementações em `apps/web/src/services/http/` para os contratos em `services/types.ts`.
2. Mantenha `mock/` como fonte offline e de desenvolvimento.
3. Selecione a implementação em `services/index.ts` com `VITE_DATA_SOURCE` (`mock` por padrão).
4. Trate carregamento e erros na tela e cubra a implementação com testes.

Nenhuma tela atual do web precisa da API NestJS. O diretório `apps/api` permanece separado e pode ser desenvolvido sem afetar a demonstração local.

## Stack

React, Vite, TypeScript, Zustand, React Router, react-i18next e CSS Modules. Idioma inicial: pt-BR; inglês está disponível nos arquivos de tradução existentes.
