# Local PostgreSQL Setup Guide

Follow these steps to run the Viewesta backend locally with PostgreSQL.

## ✅ Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 15+
- pgAdmin (optional but recommended)

## 1. Install Dependencies
```bash
npm install
```

## 2. Create Database
1. Open pgAdmin or psql
2. Run:
   ```sql
   CREATE DATABASE viewesta_db;
   ```
3. Verify:
   ```sql
   \l
   ```

## 3. Configure Environment
```bash
cp env.template .env
```
Update `.env` with your local credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viewesta_db
DB_USER=postgres
DB_PASSWORD=Remember@123#  # example
```
Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, and optional SendGrid / AWS keys as needed.

## 4. Initialize Database
```bash
npm run db:init
```
This creates all tables and seeds sample data.

- Schema only: `npm run db:schema`
- Seed only: `npm run db:seed`
- Drop tables: `npm run db:drop`

## 5. Test Database Connection
```bash
npm run test:db
```

## 6. Start Server
```bash
npm run dev
```

Server will be available at `http://localhost:3000`.

## 7. API Smoke Test
```bash
npm run test:api
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL service is running
- Verify host/port in `.env`
- Check firewall or VPN settings

### Authentication Failed
- Confirm username/password in `.env`
- Try logging in via pgAdmin with the same credentials

### Missing Tables
- Re-run `npm run db:init`
- Check console for schema errors

### Reset Database
```bash
npm run db:drop
npm run db:init
```

## Useful psql Commands
```sql
\c viewesta_db          -- connect to database
\dt                     -- list tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM movies;
```

## Next Steps
- Configure SendGrid for email flows
- Configure AWS S3 for video storage
- Implement payment credentials (Flutterwave, Stripe)

You're ready to integrate the backend with the frontend or mobile apps!

