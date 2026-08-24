# 🧭 Comfort Nomad

> **Sinta-se em casa, antes mesmo de chegar.**

Plataforma de curadoria de dados para quem vai morar, migrar ou viajar para uma nova cidade. Elimina a incerteza de só descobrir se a experiência será boa depois de chegar ao destino.

---

## ✨ Funcionalidades do MVP

| Módulo | Descrição |
|--------|-----------|
| 🌡️ **Termômetro Climático** | Compatibilidade térmica mês a mês baseada no perfil do usuário |
| 🍽️ **Radar Gastronômico** | Disponibilidade de comfort foods e estabelecimentos |
| 🏘️ **Guia de Bairros** | Custo de vida por bairro com sugestão por orçamento |
| 🌐 **Intel Cultural** | Dicas comportamentais e culturais curadas |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [Docker](https://www.docker.com/) + Docker Compose

### 1. Clone e configure o ambiente

```bash
git clone https://github.com/seu-usuario/comfort-nomad.git
cd comfort-nomad

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

### 2. Suba os serviços de infraestrutura (DB + Redis)

```bash
docker-compose up postgres redis -d
```

### 3. Instale as dependências

```bash
pnpm install
```

### 4. Execute as migrations e seeds

```bash
pnpm seed
```

Isso popula o banco com dados de **São Paulo (BR)** e **Lisboa (PT)**.

### 5. Inicie o projeto completo

```bash
pnpm dev
```

Isso inicia:
- **API**: `http://localhost:3000/api`
- **Web**: `http://localhost:5173`

---

## 🐳 Docker Compose (tudo em containers)

Para rodar tudo de uma vez em containers:

```bash
docker-compose up --build
```

---

## 🏗️ Arquitetura

```
comfort-nomad/
├── apps/
│   ├── api/          # NestJS Backend (Node.js + TypeScript)
│   └── web/          # React + Vite + TypeScript Frontend
└── packages/
    └── shared-types/ # Tipos TypeScript compartilhados
```

### Stack

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend | React 18 + Vite + TypeScript | Performance, DX excelente |
| Backend | NestJS + TypeScript | Módulos, DI, coesão com frontend |
| ORM | TypeORM | Integração nativa NestJS, migrations |
| Database | PostgreSQL | Dados relacionais, extensível para GIS |
| Cache | Redis | Cache de clima, respostas frequentes |
| Estado global | Zustand | Simples, sem boilerplate do Redux |
| Estilo | CSS Modules + design tokens | Controle total, sem dependências externas |
| i18n | react-i18next | Padrão maduro para React |
| Auth | JWT (Passport.js) | Stateless, escalável |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register       Criar conta
POST   /api/auth/login          Login
```

### Usuários
```
GET    /api/users/me            Perfil do usuário logado
PUT    /api/users/me/profile    Atualizar preferências
```

### Cidades
```
GET    /api/cities/search?q=    Buscar cidades pelo nome
GET    /api/cities/:id          Dados da cidade
GET    /api/cities/:id/overview Visão geral dos 4 módulos
```

### Clima
```
GET    /api/cities/:id/climate               Dados mensais
GET    /api/cities/:id/climate/compatibility Score de compatibilidade
```

### Comida
```
GET    /api/cities/:id/food                  Estabelecimentos
GET    /api/cities/:id/food/compatibility    Score gastronômico
```

### Bairros
```
GET    /api/cities/:id/neighborhoods                     Lista de bairros
GET    /api/cities/:id/neighborhoods/:nid/cost           Custo detalhado
GET    /api/cities/:id/neighborhoods/match?budget=       Sugestão por orçamento
```

### Cultura
```
GET    /api/cities/:id/culture               Insights curados
GET    /api/cities/:id/culture/compatibility Score cultural
POST   /api/cities/:id/culture/report        Reportar experiência (crowdsourcing)
```

---

## 🧪 Testes

```bash
# Rodar todos os testes (backend)
pnpm test

# Rodar testes em modo watch
cd apps/api && pnpm test:watch
```

Testes cobrem:
- Lógica de compatibilidade climática (`climate.service.spec.ts`)
- Lógica de compatibilidade gastronômica (`food.service.spec.ts`)

---

## 🌆 Cidades Disponíveis no MVP

| Cidade | País | Bairros | Destaques |
|--------|------|---------|-----------|
| São Paulo | 🇧🇷 Brasil | Pinheiros, Itaim Bibi, Santo André | Maior metrópole do HS, culinária diversa |
| Lisboa | 🇵🇹 Portugal | Mouraria, Chiado, Benfica | Destino favorito de brasileiros na Europa |

---

## 🔮 Roadmap (Pós-MVP)

- [ ] Integração ao vivo com Open-Meteo (clima real)
- [ ] Integração com Overpass API (POIs gastronômicos do OSM)
- [ ] Mobile app (React Native)
- [ ] Painel B2B para empresas/RH
- [ ] Crowdsourcing de experiências reais
- [ ] Motor de recomendação com ML
- [ ] Mais cidades (Berlin, Toronto, Dubai, Tokyo...)

---

## 🗂️ Modelo de Dados

### Principais Entidades

- **User** — conta do usuário
- **UserPreferenceProfile** — preferências de clima, comida, orçamento
- **City** — cidade com coordenadas e timezone
- **Neighborhood** — bairro com tier de custo
- **CostOfLiving** — breakdown mensal de custos por bairro
- **ClimateData** — médias mensais de temperatura/umidade
- **FoodEstablishment** — restaurantes e mercados com tags de comfort food
- **CulturalInsight** — dicas culturais curadas (prontas para crowdsourcing)

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua branch: `git checkout -b feature/nova-cidade`
3. Commit: `git commit -m 'feat: adiciona dados de Berlin'`
4. Push: `git push origin feature/nova-cidade`
5. Abra um Pull Request

---

## 📄 Licença

MIT © Comfort Nomad
