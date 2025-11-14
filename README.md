# Viewesta Platform Backend

African movie-streaming backend that powers user authentication, filmmaker onboarding, catalog discovery, reviews, favorites, watch history, and the foundations for monetization workflows. This repository is the canonical backend that upcoming Viewesta web/mobile frontends will integrate with.

---

## 1. Why This Project Exists

- **Mission** – Spotlight African filmmakers by offering a modern OTT experience with TVOD-style purchases, subscriptions, and wallet-driven micro transactions.
- **Phase 1 goals** – Deliver a production-ready REST API for core catalog + user features so frontend teams can build viewers, filmmaker dashboards, and admin tools in parallel.
- **Guiding principles** – Security-first auth, modular layering, database-driven workflows, ops-friendly tooling, and extensibility for later phases (payments, recommendations, analytics).

---

## 2. Capabilities & Roadmap

| Area | Implemented Today | In Progress / Planned |
|------|------------------|-----------------------|
| Auth & Profiles | Email/password signup, JWT auth, verification + reset emails, profile update, role scaffolding | Social login, stronger RBAC, device/session tracking |
| Catalog & Discovery | Categories, movies, pricing metadata, filtering, watchlists, favorites, reviews, watch history | Recommendations, trending, follows, curated rails |
| Filmmaker Ops | Movie CRUD APIs, pricing structs, status flags (pending/approved/draft) | Upload pipeline (S3/HLS), approval workflows, earnings dashboards |
| Monetization | Pricing tables + wallet scaffolding at DB level | Wallet ledger, TVOD purchases, subscription billing, Flutterwave/Stripe integration, payouts |
| Platform Ops | Health check, structured logging console, API smoke scripts, database CLI | Observability, admin endpoints, analytics, background workers |

See `docs/planning/` for the full Phase 1 requirements, daily reports, and architecture notes that guide the roadmap.

---

## 3. Architecture Overview

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│ Clients   │──▶ │ Express API    │──▶  │ PostgreSQL   │
│ (Web/Mob) │    │ (Node.js 18+)  │     │ 15+          │
└──────────┘     │               │     └─────────────┘
                 │               │─┐
                 │               │ ├─▶ Email (SMTP / SendGrid)
                 │               │ └─▶ Future: S3, Payments, Analytics
                 └───────────────┘
```

- Layered modules (`src/controllers`, `src/models`, `src/services`, `src/utils`) keep HTTP concerns separate from domain logic.
- `database/schema.sql` and `database/seeds.sql` define 20+ tables covering users, content, reviews, transactions scaffolding, etc.
- Observability is baked in with structured startup logs plus smoke scripts (`scripts/test-connection.js`, `scripts/test-api.js`).

---

## 4. Project Structure

```
viewesta-backend/
├── src/
│   ├── index.js                 # Express bootstrap + middleware wiring
│   ├── config/database.js       # pg pooled client + helper query()
│   ├── controllers/             # REST handlers per domain
│   ├── middleware/              # Auth guard, error handler, 404, etc.
│   ├── models/                  # SQL repositories per entity
│   ├── routes/                  # Route modules mounted in index.js
│   ├── services/                # Nodemailer service (extensible for others)
│   └── utils/                   # Auth helpers, Joi validation schemas
├── database/
│   ├── schema.sql               # Canonical schema (users, wallets, etc.)
│   ├── seeds.sql                # Initial categories & demo users/movies
│   └── init.js                  # CLI: schema/seed/drop orchestrator
├── scripts/
│   ├── test-connection.js       # DB connectivity smoke test
│   └── test-api.js              # API smoke run (health, catalog, signup)
├── docs/                        # Planning decks, daily status, diagrams
├── API_ENDPOINTS.md             # Detailed REST contract
├── QUICK_START.md / SETUP_LOCAL.md
├── env.template                 # All expected environment variables
└── README.md
```

---

## 5. Tech Stack & Dependencies

- **Runtime:** Node.js 18+, Express 4
- **Database:** PostgreSQL 15+, `pg` driver with pooled queries
- **Auth & Security:** `jsonwebtoken`, `bcryptjs`, role scaffolding, Helmet, CORS, rate limiting (ready to extend)
- **Validation:** Joi schemas per feature
- **Email:** Nodemailer with SendGrid defaults
- **Quality Tooling:** ESLint, Jest + Supertest (suites ready to populate), API/db scripts for quick checks
- **Cloud Targets:** AWS (S3, SES/SendGrid, CloudFront) + payment providers (Flutterwave, Stripe) per roadmap

---

## 6. Getting Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/bodyempire/viewesta-platform-backend.git
   cd viewesta-platform-backend
   npm install
   ```
2. **Configure Environment**
   ```bash
   cp env.template .env
   ```
   Fill in database credentials, JWT secrets, and SMTP values:
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=viewesta_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=replace-me
   JWT_REFRESH_SECRET=replace-me
   EMAIL_FROM=noreply@viewesta.com
   SMTP_PASSWORD=your-sendgrid-key
   FRONTEND_URL=http://localhost:5173
   ```
3. **Database Bootstrapping**
   ```bash
   npm run db:init    # schema + seed
   # or granular:
   npm run db:schema
   npm run db:seed
   ```
4. **Run Locally**
   ```bash
   npm run dev        # nodemon-style reload via node --watch
   # Production-style
   npm run start
   ```
5. **Smoke Tests**
   ```bash
   npm run test:db    # verify credentials + table count
   npm run test:api   # health, categories, movies, register
   ```
6. **Lint & Unit Tests**
   ```bash
   npm run lint       # requires .eslintrc (coming soon)
   npm run test       # Jest placeholder until suites are added
   ```

---

## 7. Key API Endpoints

- `GET /health` – service heartbeat
- `POST /api/v1/auth/register|login|request-reset|verify` – auth lifecycle
- `GET /api/v1/categories` – browse categories
- `GET /api/v1/movies` – list movies with filters / pagination
- `POST /api/v1/movies` – create (filmmaker/admin)
- `POST /api/v1/watchlist` / `favorites` / `reviews` / `progress` – engagement features
- Full contract documented in `API_ENDPOINTS.md`.

Request validation is enforced via Joi; all protected routes expect `Authorization: Bearer <JWT>`.

---

## 8. Operational Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with file watching |
| `npm run start` | Production mode |
| `npm run db:init` | Create schema + seed sample data |
| `npm run db:drop` | Drop schema (irreversible) |
| `npm run test:db` | Database connectivity smoke |
| `npm run test:api` | API smoke tests (requires server running) |
| `npm run lint` | ESLint across `src/**/*.js` |
| `npm run test` | Jest test runner w/ coverage (suites TBD) |

---

## 9. Deployment & Environments

- **Local:** `.env` file with Postgres + SMTP; recommended using Dockerized Postgres for consistency.
- **Staging/Prod:** Provision PostgreSQL (AWS RDS, Supabase, etc.), configure SendGrid credentials, and set CDN/storage endpoints once uploads roll out.
- **Tunneling for Frontend:** Use `ngrok http 3000` or similar to expose your local API to frontend teammates.
- **Observability:** Extend `src/index.js` logging or plug in something like Pino + APM once deployed.

---

## 10. Quality & Contribution Checklists

Before opening a PR:
1. Run `npm run test:db` and `npm run test:api`.
2. Add/Update Jest specs (coming soon) and run `npm run test -- --runInBand`.
3. Ensure lint passes (`npm run lint`) once config lands.
4. Update docs (`API_ENDPOINTS.md`, `COMPLETED_FEATURES.md`) when new APIs or features are introduced.

Contribution steps stay standard:
```bash
git checkout -b feature/amazing-update
# implement feature + tests
git commit -m "feat: amazing update"
git push origin feature/amazing-update
```
Open a PR and link relevant planning docs or tickets.

---

## 11. Current Gaps & Next Milestones

- Payments + wallet ledger (Flutterwave/Stripe integration, purchase + subscription flows)
- Filmmaker/admin dashboards (approvals, analytics, payouts)
- Media pipeline (uploads, transcoding, signed delivery URLs)
- Recommendation engine + social graph (follows, trending, personalization)
- Notification service (email, push, in-app)
- Automated test coverage + ESLint config

See `docs/planning/Viewesta Phase1 Requirements.md` for the authoritative backlog and daily reports for latest progress.

---

## 12. License & Ownership

© Samalync Ltd / Viewesta. All rights reserved. Internal use only unless explicit permission granted.

---

Need help? Ping the backend channel or open a GitHub issue describing your blocker.