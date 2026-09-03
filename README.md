# Node.js Backend Full Course — Practice Repository 🔥

> My personal follow-along repository for the **Node.js Backend Full Course | Modern Backend Development for 2025**.  
> This repo contains all four chapter projects, refined notes, and REST client test files built during the course.

---

## 📋 Course Overview

This course covers everything from how the internet works to building fully containerized, production-ready backend systems. Each chapter is a standalone project that builds on the skills from the previous one.

| | |
|---|---|
| 📹 **Video** | 5+ hours of on-demand content |
| 📝 **Notes** | Detailed notes for each chapter (in this repo) |
| 🏆 **Projects** | 4 real-world backend projects |
| 🧪 **Testing** | REST client files included for every project |

---

## 🗂️ Repository Structure

```
Backend-Full-Course-Practice/
├── Chapter_1/          # Theory — How the internet & full stack works
│   ├── Before CH 1.docx
│   └── CH 01.docx
│
├── Chapter_2/          # Beginner Node.js + Express REST API
│   ├── server.js
│   ├── package.json
│   └── test.rest
│
├── Chapter_3/          # Express + SQLite + JWT Auth + Frontend
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── middleware/
│   │   └── routes/
│   ├── public/
│   ├── chapter3-notes-refined.md
│   └── todo-app.rest
│
├── Chapter_4/          # Express + PostgreSQL + Prisma + Docker
│   ├── src/
│   │   ├── server.js
│   │   ├── prismaClient.js
│   │   ├── middleware/
│   │   └── routes/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   ├── Dockerfile
│   ├── docker-compose.yaml
│   ├── todo-app.rest
│   └── chapter_4_notes.md
│
├── nvm_windows_notes.docx
└── why_nvm.docx
```

---

## 📚 Chapter Breakdown

### Chapter 1 — Theory: How the Internet Works

**No code.** This chapter is purely conceptual.

- How clients and servers communicate over HTTP
- What the full stack means (frontend, backend, database)
- DNS, IP addresses, ports, and request/response cycle
- REST API fundamentals

📄 Notes: `Chapter_1/CH 01.docx`

---

### Chapter 2 — Beginner Node.js REST API

**Tech stack:** Node.js · Express 5 · CommonJS · nodemon

A minimal backend server that introduces core REST API concepts with in-memory data storage.

**What's built:**
- `GET /` — Home page (serves HTML)
- `GET /dashboard` — Dashboard page
- `GET /api/data` — Returns in-memory data array
- `POST /api/data` — Adds a new entry
- `DELETE /api/data` — Removes the last entry

**Run locally:**
```bash
cd Chapter_2
npm install
npm run dev        # nodemon server.js — runs on port 8383
```

**Test it:** `Chapter_2/test.rest`

---

### Chapter 3 — Full-Stack Todo App (Express + SQLite + JWT)

**Tech stack:** Node.js 22 · Express 5 · SQLite (built-in `node:sqlite`) · bcryptjs · jsonwebtoken · ES Modules

A complete full-stack Todo application with user authentication, a SQLite database, and a served HTML frontend. No ORM — raw SQL via Node's built-in `DatabaseSync`.

**Project structure:**
```
src/
├── server.js              # Entry point, static file serving
├── db.js                  # SQLite in-memory DB + schema setup
├── middleware/
│   └── authMiddleware.js  # JWT verification
└── routes/
    ├── authRoutes.js      # POST /auth/register, POST /auth/login
    └── todoRoutes.js      # GET/POST/PUT/DELETE /todos
public/
└── index.html             # Served frontend UI
```

**Key concepts:**
- In-memory SQLite with raw SQL (`CREATE TABLE`, `INSERT`, `SELECT`)
- Password hashing with `bcryptjs`
- JWT signing & verification (24h expiry)
- Protected routes via `authMiddleware`
- Serving static frontend files with `express.static`
- `__dirname` reconstruction in ES Modules

**Run locally:**
```bash
cd Chapter_3
npm install
# Create a .env file with: JWT_SECRET=your_secret_here
npm run dev        # node --watch --env-file=.env — runs on port 5003
```

**Test it:** `Chapter_3/todo-app.rest`  
📄 Notes: `Chapter_3/chapter3-notes-refined.md`

---

### Chapter 4 — Full-Stack Todo App (Express + PostgreSQL + Prisma + Docker)

**Tech stack:** Node.js 22 · Express 5 · PostgreSQL · Prisma ORM · bcryptjs · jsonwebtoken · Docker · Docker Compose · ES Modules

A production-grade evolution of Chapter 3. Replaces the in-memory SQLite database with a persistent, containerized PostgreSQL database managed through Prisma ORM.

**Project structure:**
```
src/
├── server.js              # Entry point
├── prismaClient.js        # Singleton Prisma client
├── middleware/
│   └── authMiddleware.js  # JWT verification, injects req.userId
└── routes/
    ├── authRoutes.js      # POST /auth/register, POST /auth/login
    └── todoRoutes.js      # GET/POST/PUT/DELETE /todos (all protected)
prisma/
├── schema.prisma          # User + Todo models (PostgreSQL)
└── migrations/            # Auto-generated migration history
public/
└── index.html             # Served frontend UI
Dockerfile                 # node:22-alpine + openssl + prisma generate
docker-compose.yaml        # app + db services
```

**Key upgrades over Chapter 3:**

| Feature | Chapter 3 | Chapter 4 |
|---|---|---|
| Database | SQLite (in-memory) | PostgreSQL (persistent) |
| DB Access | Raw SQL | Prisma ORM |
| Deployment | Local only | Dockerized |
| Data persistence | ❌ Lost on restart | ✅ Docker volume |

**Run with Docker (recommended):**
```bash
cd Chapter_4
docker-compose up --build
```
> App available at `http://localhost:5003`

**Run locally (requires a running PostgreSQL instance):**
```bash
cd Chapter_4
npm install
# Create a .env file with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todoapp
# JWT_SECRET=your_secret_here
npx prisma migrate dev --name init
node ./src/server.js
```

**Test it:** `Chapter_4/todo-app.rest`  
📄 Notes: `Chapter_4/chapter_4_notes.md`

---

## 🛠️ Tech Stack Summary

| Technology | Used In | Purpose |
|---|---|---|
| **Node.js 22** | Ch2, Ch3, Ch4 | JavaScript runtime |
| **Express 5** | Ch2, Ch3, Ch4 | Web framework & routing |
| **SQLite** (`node:sqlite`) | Ch3 | Built-in in-memory database |
| **PostgreSQL** | Ch4 | Production-grade relational DB |
| **Prisma ORM** | Ch4 | Type-safe DB queries & migrations |
| **bcryptjs** | Ch3, Ch4 | Password hashing |
| **jsonwebtoken** | Ch3, Ch4 | JWT auth tokens |
| **Docker** | Ch4 | App containerization |
| **Docker Compose** | Ch4 | Multi-service orchestration |
| **NVM** | All | Node version management |

---

## 🔑 Key Concepts Learned

- **REST API design** — HTTP verbs, routes, status codes
- **CRUD operations** — Create, Read, Update, Delete against a database
- **JWT Authentication** — stateless auth with signed tokens, protected routes
- **Password security** — one-way hashing with bcrypt, never storing plain text
- **SQL fundamentals** — table creation, foreign keys, queries
- **Prisma ORM** — schema-first modeling, migrations, type-safe client
- **Docker** — writing Dockerfiles, multi-service Compose setups, volume persistence
- **ES Modules** — `import`/`export`, reconstructing `__dirname` in ESM
- **Environment variables** — `.env` files, `--env-file` flag, Docker env injection

---

## ⚙️ Prerequisites

- Basic JavaScript knowledge
- Node.js installed (use NVM — see `nvm_windows_notes.docx`)
- Docker Desktop (for Chapter 4)
- VS Code with the **REST Client** extension (for `.rest` test files)

---

## 📖 Course

Original course by **James** (smoljames) — [smoljames.com](https://www.smoljames.com)
