# Regras do Comfort Nomad v2

- Apenas `apps/web` é executado no caminho padrão; manter tudo mockado e sem rede até autorização explícita.
- Componentes usam contratos de `services/`, nunca seeds diretamente.
- Dados são fictícios e identificados como ilustrativos. Recomendações e destaques devem passar por IDs conhecidos do seed.
- Perfil anônimo e conta local devem continuar funcionais; persistir apenas o necessário no navegador.
- Tipos de domínio centralizados, TypeScript estrito, sem `any`, estados acessíveis de carregamento/vazio/erro.
- pt-BR é o idioma inicial; manter pt-BR, inglês e espanhol.
- Não ler, imprimir, incluir em commit ou modificar `.env*`. Preservar `.git`, documentos, imagens, logos e fotos.
- `legacy/v1` é somente referência e fica fora do build/workspace.
- Antes de concluir alterações em `apps/web`, executar `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build`.
