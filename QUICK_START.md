# Quick Start Guide

Get the Viewesta backend running in minutes.

## 1. Clone & Install
```bash
git clone https://github.com/Samalync-Ltd/viewesta-backend.git
cd viewesta-backend
npm install
```

## 2. Configure Environment
```bash
cp env.template .env
```
Update `.env` with your PostgreSQL credentials.

## 3. Initialize Database
```bash
npm run db:init
```

## 4. Start the Server
```bash
npm run dev
```

- API: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/health`

## 5. Test
```bash
npm run test:db
npm run test:api
```

## Checklist
- [ ] Dependencies installed
- [ ] `.env` configured
- [ ] Database created
- [ ] `npm run db:init` successful
- [ ] Server running (`npm run dev`)
- [ ] Smoke tests passing

You're good to go! 🎉

