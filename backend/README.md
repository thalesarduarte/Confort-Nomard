# Comfort Nomad API

Flask API em Python com camadas de domínio, casos de uso, repositórios SQLAlchemy e apresentação HTTP. PostgreSQL é o banco suportado nesta primeira etapa; as tabelas são criadas exclusivamente por Alembic. Nenhum seed de cidades é incluído.

## Rodar localmente (PowerShell)

Pré-requisitos: Python 3.12+, Docker Compose e PostgreSQL 16.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements-dev.txt
$env:POSTGRES_PASSWORD = 'senha-local-temporaria'
docker compose -f compose.postgres.yml up -d
$env:DATABASE_URL = "postgresql+psycopg://comfort_nomad:$($env:POSTGRES_PASSWORD)@localhost:5432/comfort_nomad"
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:PYTHONPATH = (Resolve-Path backend).Path
alembic -c backend\alembic.ini upgrade head
python backend\run.py
```

Health check: `http://127.0.0.1:8000/api/v1/health`. Cidades retornam uma lista vazia até conteúdo com procedência ser aprovado. Para acessar essa API a partir do Expo, configure `EXPO_PUBLIC_API_URL` com um endereço acessível pelo dispositivo; não aponte o web para a API sem uma decisão explícita de integração.

## Endpoints iniciais

- `GET /api/v1/health`
- `GET /api/v1/cities?q=&limit=` e `GET /api/v1/cities/{slug}`
- `POST /api/v1/auth/register` e `POST /api/v1/auth/login`
- `GET /api/v1/users/me/preferences` e `PUT /api/v1/users/me/preferences` (Bearer JWT)

O contrato OpenAPI está em `openapi.yaml`. Tokens são de curta duração, senhas usam scrypt, e `JWT_SECRET` deve ter ao menos 32 caracteres. Não há integração de pagamento, reserva, IA externa ou ingestão de terceiros.

## Migrações e testes

```powershell
$env:PYTHONPATH = (Resolve-Path backend).Path
alembic -c backend\alembic.ini upgrade head
python -m unittest discover -s backend\tests -v
```

Revisar cada migração antes de aplicá-la. Para PostgreSQL de produção, use backup e uma etapa de pre-deploy de migração; o `render.yaml` configura essa etapa para o serviço.

## Variáveis de ambiente

| Nome | Necessária | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim para rotas de dados | URL SQLAlchemy `postgresql+psycopg://...` |
| `JWT_SECRET` | Sim para autenticação | Segredo aleatório com no mínimo 32 caracteres |
| `JWT_ISSUER` | Não | Emissor do token; padrão `comfort-nomad-api` |
| `ACCESS_TOKEN_TTL_SECONDS` | Não | Validade; padrão 900 segundos |
| `CORS_ORIGINS` | Não | Origens explícitas; padrão localhost Vite |
| `FLASK_DEBUG` | Não | Debug local, padrão `false` |

Segredos devem ser definidos no ambiente de execução/gerenciador de segredos e nunca versionados.

O serviço do blueprint Render usa um plano Starter para permitir pre-deploy de migrações, e cria um Postgres Basic-256MB. Sincronizar esse blueprint cria recursos pagos na conta Render; revise preços/planos atuais antes de sincronizar.
