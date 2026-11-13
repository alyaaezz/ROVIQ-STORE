# Hoodie Store — Full-stack starter

A customizable clothing store with React/Vite frontend, Express API, PostgreSQL + Prisma, admin dashboard, product management, order management, and manual payment proof upload.

## Requirements
- Node.js 20+
- PostgreSQL database
- Cloudinary account (for product images and payment proofs)

## 1) Backend setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
The API runs at http://localhost:5000.

Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, and Cloudinary credentials in `backend/.env`.
The seed creates the first admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## 2) Frontend setup
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173.

## Admin
Open `/admin/login` and use the credentials configured in `backend/.env`.
Change the seed password before deploying. Never commit `.env` files.

## Payment flow
- Cash on delivery: customer places order directly.
- Vodafone Cash / InstaPay: customer enters the transfer reference and uploads proof.
- Admin verifies the transfer manually and updates payment status.
This starter does NOT automatically connect to a wallet or bank account and does NOT verify screenshots automatically.

## Production deployment
- Deploy backend to a Node hosting provider that supports persistent environment variables.
- Deploy frontend to a static hosting provider.
- Use managed PostgreSQL.
- Configure `CLIENT_URL` to the deployed frontend origin and `VITE_API_URL` to the deployed backend URL ending in `/api`.
- Configure Cloudinary and use HTTPS.
- Run `npx prisma migrate deploy` in production.
- Create the first admin securely; do not use demo credentials.
- Set up database backups and monitor hosting/storage limits.

Free hosting tiers may sleep, have limits, or change. For dependable always-on service, choose paid plans as needed. The customer should own/pay for the domain, hosting, database, and image-storage accounts.

## Important before handing to a client
This is a working starter, not a substitute for production security review. Add rate limiting, email/phone verification, order notification, privacy/terms pages, tax/shipping rules, backup monitoring, and test all flows. Do not store card details. Keep payment proof private; this starter stores proof images in Cloudinary with restricted access settings not guaranteed by a basic unsigned setup, so configure secure delivery/access before real customer use.
