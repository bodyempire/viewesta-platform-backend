# Viewesta Platform Backend

African movie streaming platform backend API built with Node.js, Express, and PostgreSQL.

## 🚀 Overview

Viewesta empowers African filmmakers by providing a digital platform to showcase and monetize their movies globally. This backend exposes REST APIs for authentication, movie catalog management, pricing, reviews, watchlists, favorites, watch history, and more.

## 🧱 Tech Stack

- Node.js 18+
- Express.js
- PostgreSQL 15+
- JWT Authentication
- Joi validation
- Helmet, CORS, Rate Limiting
- Nodemailer (SendGrid)
- AWS SDK (S3 integration ready)
- Jest + Supertest (testing)

## 📁 Project Structure

```
viewesta-backend/
├── src/
│   ├── index.js                # Express server entry point
│   ├── config/                 # Configuration (database)
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware (auth, errors)
│   ├── models/                 # Database models
│   ├── routes/                 # API route definitions
│   ├── services/               # Email service, etc.
│   └── utils/                  # Helpers (auth, validation)
├── database/
│   ├── schema.sql              # PostgreSQL schema (20+ tables)
│   ├── seeds.sql               # Sample data
│   └── init.js                 # Initialization CLI
├── scripts/
│   ├── test-connection.js      # Database health check
│   └── test-api.js             # API smoke tests
├── docs/                       # Documentation (planning, daily reports, etc.)
├── env.template                # Environment variable template
└── README.md
```

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/Samalync-Ltd/viewesta-backend.git
cd viewesta-backend
npm install
```

### 2. Configure Environment
```bash
cp env.template .env
```
Update `.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viewesta_db
DB_USER=postgres
DB_PASSWORD=your_password
```
Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, and optional SendGrid/AWS keys.

### 3. Initialize Database
```bash
npm run db:init
```
This creates all tables and seeds sample data.

### 4. Run the Server
```bash
npm run dev
```
Server: `http://localhost:3000`
Health: `http://localhost:3000/health`
API base: `http://localhost:3000/api/v1`

### 5. Test
```bash
npm run test:db     # Database connection test
npm run test:api    # API smoke tests
```

## 🔐 Authentication
- Register, login, refresh
- Email verification
- Password reset
- Profile update
- Role-based access (viewer, filmmaker, admin)

## 🎬 Movie Ecosystem
- CRUD movies with filtering/search
- Categories (admin)
- Pricing per quality (TVOD)
- Video files metadata (S3-ready)
- Reviews & ratings
- Watchlist & favorites
- Watch history & continue watching

## 📦 Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run start` | Start production server |
| `npm run db:init` | Initialize schema + seed data |
| `npm run db:schema` | Apply schema only |
| `npm run db:seed` | Seed sample data |
| `npm run db:drop` | Drop all tables (danger!) |
| `npm run test:db` | Test database connection |
| `npm run test:api` | Run API smoke tests |
| `npm run lint` | Lint source files |

## 📚 Documentation
- `SETUP_LOCAL.md` – Detailed local setup guide
- `QUICK_START.md` – 5-minute quick start
- `API_ENDPOINTS.md` – Full endpoint reference
- `COMPLETED_FEATURES.md` – Progress tracker

## 🔮 Next Steps
- Payments (Flutterwave, Stripe)
- AWS S3 integration for uploads
- Admin / Filmmaker dashboards
- Analytics & reporting

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'feat: add new feature'`)
4. Push branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

**Viewesta Platform Backend** © Samalync Ltd. All rights reserved.

