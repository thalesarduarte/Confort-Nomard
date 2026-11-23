# Arquitetura v2 — base de expansão

## Caminhos ativos

- `apps/web`: experiência web existente, mock local por padrão. A API nova não é escolhida automaticamente pelo frontend.
- `apps/mobile`: cliente Expo separado que lê a lista de cidades da API; sem regras de recomendação ou dados de catálogo duplicados.
- `backend`: API Flask com domínio independente de SQLAlchemy, casos de uso, repositórios, PostgreSQL e migrações Alembic.
- `legacy/v1`: somente referência, fora do caminho de build.

O `render.yaml` descreve a API e o PostgreSQL; sincronizá-lo provisiona recursos pagos. `vercel.json` publica apenas o SPA Vite existente. Nenhum deploy foi disparado nem o frontend foi apontado para a API.

## Limites desta etapa

A API define usuários, perfil de preferências e entidades de cidades, bairros, custo, clima, estabelecimentos e conteúdo cultural. Não existem seeds, sincronização de terceiros, recomendação calculada no servidor, upload de contribuição, denúncia, moderação real, reservas nem pagamentos. Conteúdo de cidade só deve ser publicado após curadoria e registro da fonte, data e confiança. O catálogo vazio é intencional.

## Evolução segura

1. Validar migrations e API no PostgreSQL local.
2. Definir processo editorial, fontes e retenção de histórico antes de importar cidades.
3. Especificar e implementar ingestão autorizada, com validade e procedência por campo.
4. Publicar endpoints de leitura e contrato versionado; gerar clientes web/mobile em uma mudança separada.
5. Implementar autorização, denúncia, fila de revisão e auditoria antes de aceitar conteúdo público.
6. Avaliar autenticação reforçada, limites de requisição, observabilidade, backup e plano de recuperação antes de produção.

As migrations não carregam conteúdo fictício e o app web continua desacoplado da API até autorização e integração revisada.
