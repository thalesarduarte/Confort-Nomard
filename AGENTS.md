# Comfort Nomad: regras para futuras alterações

- Preserve o monorepo pnpm e a stack React, Vite, TypeScript, Zustand, React Router e react-i18next.
- O caminho padrão do frontend é totalmente local: `pnpm install && pnpm --filter web dev` deve funcionar sem rede e sem `apps/api`.
- Não conecte o frontend a APIs externas, ao backend ou a provedores de IA enquanto a fonte mock for a ativa.
- Mantenha heurísticas determinísticas e dados fictícios identificados como ilustrativos. Serviços que simulam processamento devem ter loading e atraso curto.
- Componentes e stores consomem contratos em `apps/web/src/services/`; não importam diretamente seeds. Dados persistentes usam o wrapper localStorage.
- Não apague nem quebre `apps/api`. Integrações futuras devem ser implementadas em `services/http/` e selecionadas por `VITE_DATA_SOURCE`, mantendo `mock` como padrão.
- Centralize contratos de domínio em `services/types.ts`. Evite `any`, preserve estados de carregamento/vazio/erro e acessibilidade por teclado, labels e contraste.
- Mantenha pt-BR como idioma inicial e traduza strings de interface nos recursos i18n existentes.
- Recomendações só podem citar IDs presentes no seed ativo. Use filtros de IDs conhecidos para conteúdo gerado.
- Antes de concluir alterações no web, execute `pnpm --filter web typecheck`, `build`, `lint` e `test`; corrija os problemas introduzidos.
- Não use dados pessoais ou senhas reais na persistência local de demonstração.
