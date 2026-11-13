# Comfort Nomad v2

Plataforma local de demonstração para ajudar expatriados, nômades digitais e viajantes a imaginar a vida numa nova cidade antes da mudança.

## Rodar

```sh
pnpm install
pnpm dev
```

O comando inicia apenas o frontend mockado em `http://127.0.0.1:5173`. Não requer `.env`, backend, internet em runtime nem chave de API. A primeira instalação precisa ter as dependências disponíveis no cache do pnpm ou ser feita com conexão.

## Comandos

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Organização

- `apps/web/src/features`: fluxos de produto por feature.
- `apps/web/src/services`: contratos e implementação mock local.
- `apps/web/src/domain`: cálculo, recomendação, migração e simulação determinísticos.
- `apps/web/src/design`: tokens e componentes base.
- `legacy/v1`: código anterior preservado e fora do workspace.
- `docs/design-system.md`: identidade visual e regras de acessibilidade.

As contribuições e preferências persistem no `localStorage` deste navegador. O seed é ilustrativo e não deve ser usado para decisões de visto, custo ou segurança.

## Trocar para dados reais no futuro

Implementar adaptadores em `apps/web/src/services/http/` que atendam aos mesmos contratos de `services/types.ts`; selecionar a implementação por `VITE_DATA_SOURCE`. A fonte padrão continua sendo `mock`. A versão atual não contém chamadas de rede na aplicação web.
