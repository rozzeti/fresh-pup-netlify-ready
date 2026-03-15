# Fresh Pup 🐾

A full-stack dog-grooming booking app built with React (pre-built static bundle), Vercel Serverless Functions, and MongoDB Atlas.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Local Development](#local-development)
6. [First-Time Setup — Seed the Admin User](#first-time-setup--seed-the-admin-user)
7. [Deploying to Vercel](#deploying-to-vercel)
8. [API Reference](#api-reference)
9. [Admin Dashboard](#admin-dashboard)

---

## Project Structure

```
fresh-pup-netlify-ready/   ← pre-built static React app (served as the frontend)
  index.html
  static/
  images/

api/                       ← Vercel Serverless Functions (Node.js / CommonJS)
  auth/
    login.js               POST /api/auth/login
    logout.js              POST /api/auth/logout
  bookings/
    create.js              POST /api/bookings/create
    list.js                GET  /api/bookings/list   (admin-only)
  services/
    index.js               GET  /api/services
    create.js              POST /api/services/create (admin-only)
    update.js              PUT  /api/services/update (admin-only)
    delete.js              DELETE /api/services/delete (admin-only)
  availability/
    index.js               GET  /api/availability
    block.js               POST /api/availability/block (admin-only)
  lib/
    mongodb.js             shared MongoDB connection pool
    jwt.js                 sign / verify JWT helpers

src/                       ← React source files (reference; app is pre-built)
  pages/
    BookingPage.jsx        public multi-step booking wizard
    admin/
      AdminLogin.jsx
      AdminDashboard.jsx
      BookingsList.jsx
      ServiceManager.jsx
      AvailabilityManager.jsx

scripts/
  seed-admin.js            one-time script to create the initial admin account

vercel.json                Vercel deployment config
.env.example               template for required environment variables
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Tailwind CSS, shadcn/ui   |
| API        | Vercel Serverless Functions (Node)  |
| Database   | MongoDB Atlas                       |
| Auth       | JWT (HttpOnly cookie) + bcryptjs    |

---

## Prerequisites

- **Node.js** ≥ 18
- A **MongoDB Atlas** cluster (free tier is fine) — [create one here](https://www.mongodb.com/cloud/atlas/register)
- A **Vercel** account for deployment — [sign up here](https://vercel.com/signup)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable         | Required | Description                                    |
|------------------|----------|------------------------------------------------|
| `MONGODB_URI`    | ✅       | MongoDB Atlas connection string                |
| `JWT_SECRET`     | ✅       | Long random string used to sign admin JWTs     |
| `JWT_EXPIRATION` | optional | Token lifetime (default: `24h`)                |

**Generating a strong `JWT_SECRET`:**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Local Development

Install dependencies and run the Vercel dev server (serves both the static frontend and the API functions):

```bash
npm install
npx vercel dev
```

The app will be available at `http://localhost:3000`.

> **Note:** The frontend is a pre-built static bundle in `fresh-pup-netlify-ready/`. If you modify React source files in `src/`, you will need to rebuild the app with a CRA/Vite toolchain and copy the output into that directory.

---

## First-Time Setup — Seed the Admin User

Before you can log in to the admin dashboard, you must create an admin user in MongoDB. Run the seed script once after setting up your `.env`:

```bash
node scripts/seed-admin.js
```

By default it creates:

| Field    | Default value         |
|----------|-----------------------|
| username | `admin`               |
| password | `changeme123`         |

**Change the password immediately after first login** (or pass your own credentials via environment variables — see the script for details).

To use custom credentials:

```bash
ADMIN_USERNAME=myadmin ADMIN_PASSWORD=supersecret node scripts/seed-admin.js
```

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/new).
3. Set the **Output Directory** to `fresh-pup-netlify-ready` (already configured in `vercel.json`).
4. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRATION`) in **Project Settings → Environment Variables**.
5. Deploy — Vercel auto-detects the `api/` folder and deploys every file as a serverless function.

### MongoDB Atlas network access

In your Atlas cluster go to **Network Access** and add `0.0.0.0/0` (allow all) so Vercel's dynamic IPs can connect, or use [Vercel's static outbound IPs](https://vercel.com/docs/security/deployment-protection/methods-to-protect-deployments/vercel-authentication#static-ip-addresses) and allowlist only those.

---

## API Reference

All endpoints live under `/api/`. Write endpoints (create/update/delete) require a valid `admin_token` cookie obtained by logging in.

### Auth

| Method | Path               | Auth | Body / Notes                          |
|--------|--------------------|------|---------------------------------------|
| POST   | `/api/auth/login`  | —    | `{ username, password }` → sets cookie |
| POST   | `/api/auth/logout` | —    | Clears the `admin_token` cookie        |

### Bookings (public booking wizard)

| Method | Path                   | Auth  | Notes                               |
|--------|------------------------|-------|-------------------------------------|
| POST   | `/api/bookings/create` | —     | Submit a new booking from the wizard |
| GET    | `/api/bookings/list`   | admin | Returns all bookings                 |

### Services

| Method | Path                      | Auth  | Body / Query                                               |
|--------|---------------------------|-------|------------------------------------------------------------|
| GET    | `/api/services`           | —     | List all services (used by the wizard)                     |
| POST   | `/api/services/create`    | admin | `{ name, description, basePrice, duration }`               |
| PUT    | `/api/services/update`    | admin | `{ id, name, description, basePrice, duration }`           |
| DELETE | `/api/services/delete`    | admin | Query string: `?id=<serviceId>`                            |

### Availability

| Method | Path                        | Auth  | Notes                                 |
|--------|-----------------------------|-------|---------------------------------------|
| GET    | `/api/availability`         | —     | Returns blocked dates                  |
| POST   | `/api/availability/block`   | admin | `{ date }` (YYYY-MM-DD) — toggle block |

---

## Admin Dashboard

Navigate to `/admin/login` on your deployed site.

| Tab            | What it does                                   |
|----------------|------------------------------------------------|
| 📋 Bookings    | View all submitted bookings with status badges |
| ✂️ Services    | Create / edit / delete grooming services       |
| 📅 Availability| Click calendar days to block or unblock dates  |

> The admin dashboard is only accessible from the browser — all write API calls require the `admin_token` cookie that is set on successful login.
