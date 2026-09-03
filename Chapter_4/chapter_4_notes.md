# Chapter 4 — Detailed Notes

## 1. Chapter 4 Project Overview

Chapter 4 builds a more advanced backend application, evolving directly from Chapter 3's project. The goal is to create a robust, **full-stack** Todo application using **Node.js**, **Express 5**, **PostgreSQL** (via **Prisma ORM**), and **Docker**. A key upgrade over Chapter 3 is replacing the in-memory SQLite database with a persistent, containerized PostgreSQL database — making the app production-ready.

---

## 2. Setting Up the Environment

### Node Version Manager (NVM)

- **NVM** manages different Node.js versions. Install it via the command in the course docs.
- Check version:
  ```bash
  nvm -v
  ```
- Use Node 22 (required for `--watch` and `--env-file` built-in flags):
  ```bash
  nvm use 22
  ```

### Required Installations

1. **Visual Studio Code** — primary code editor.
2. **Node.js v22** — runtime; needed for built-in `--watch` and `--env-file` flags used in the dev script.
3. **Docker** — containerizes both the app and the PostgreSQL database.

> **Note:** The `pg` package is **not** installed directly. Prisma handles the PostgreSQL connection internally.

---

## 3. Project Structure

```
Chapter_4/
├── src/
│   ├── server.js                  # Main entry point
│   ├── db.js                      # Leftover from Ch3 (SQLite — not used in Ch4)
│   ├── prismaClient.js            # Singleton Prisma client
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   └── routes/
│       ├── authRoutes.js          # /auth/register, /auth/login
│       └── todoRoutes.js          # /todos CRUD (protected)
├── prisma/
│   ├── schema.prisma              # Database schema (User + Todo models)
│   └── migrations/                # Auto-generated migration history
├── public/
│   ├── index.html                 # Frontend UI
│   ├── fanta.css                  # Main CSS
│   └── styles.css                 # Additional styles
├── Dockerfile                     # Container definition for the app
├── docker-compose.yaml            # Defines app + db services
├── todo-app.rest                  # REST client test file
├── .dockerignore
└── package.json
```

> **Note:** [`db.js`](file:///f:/Git_Repos/Backend-Full-Course-Practice/Chapter_4/src/db.js) still exists from Chapter 3 but is **not imported** in Chapter 4. The project now exclusively uses Prisma.

---

## 4. Dependencies (`package.json`)

```bash
npm install express @prisma/client bcryptjs jsonwebtoken
npm install -D prisma
```

| Package | Role |
|---|---|
| `express` `^5.2.1` | Web framework (Express **5** — the latest major version) |
| `@prisma/client` `^5.22.0` | Auto-generated type-safe DB client |
| `bcryptjs` `^3.0.3` | Password hashing & comparison |
| `jsonwebtoken` `^9.0.3` | JWT signing & verification |
| `prisma` (dev) `^5.22.0` | Prisma CLI for migrations & schema management |

> **No `pg` package** is listed — Prisma bundles its own PostgreSQL driver.

### Dev Script

```json
"dev": "node --watch --env-file=.env --experimental-strip-types --experimental-sqlite ./src/server.js"
```

- `--watch` — restarts server on file changes (built-in Node 22, no `nodemon` needed)
- `--env-file=.env` — loads environment variables without `dotenv`
- `--experimental-strip-types` — allows TypeScript-like syntax (unused here but present)
- `--experimental-sqlite` — a holdover flag from Ch3; not functionally used in Ch4

---

## 5. Database Setup — Prisma + PostgreSQL

### Why Prisma instead of raw SQL?

In Chapter 3, `db.js` used Node's built-in `DatabaseSync` with raw SQL strings. Chapter 4 replaces this with **Prisma**, an ORM that:
- Provides a type-safe JavaScript API for queries
- Manages database schema via a `schema.prisma` file
- Handles migrations automatically

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Read from .env or Docker environment
}

model User {
  id        Int     @id @default(autoincrement())
  username  String  @unique
  password  String
  todos     Todo[]  // One-to-many relation
}

model Todo {
  id        Int     @id @default(autoincrement())
  task      String
  completed Boolean @default(false)
  userId    Int
  user      User    @relation(fields: [userId], references: [id])
}
```

### `src/prismaClient.js` — Singleton Pattern

```js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```

This file creates a single shared `PrismaClient` instance imported by all route files. Creating it once avoids connection pool exhaustion.

### Running Migrations

```bash
npx prisma migrate dev --name init
```

This generates SQL migration files in `prisma/migrations/` and applies them to the database.

---

## 6. Docker Setup

### `Dockerfile`

```dockerfile
FROM node:22-alpine
WORKDIR /app

# Prisma requires OpenSSL on Alpine Linux
RUN apk add --no-cache openssl

COPY package*.json .
RUN npm install
COPY . .

# Generate Prisma Client for the container's OS/arch
RUN npx prisma generate

EXPOSE 5003
CMD ["sh", "-c", "npx prisma generate && node ./src/server.js"]
```

Key points:
- Uses `node:22-alpine` (lightweight base image).
- **Must install `openssl`** on Alpine because Prisma's query engine binary depends on it.
- Runs `npx prisma generate` both at build time **and** at startup — the startup call ensures the volume-mounted source has the generated client.

### `docker-compose.yaml`

Two services are defined:

| Service | Details |
|---|---|
| `app` (todo-app) | Builds from `Dockerfile`, port `5003:5003`, depends on `db` |
| `db` (postgres-db) | `postgres:13-alpine` image, port `5432:5432`, persistent volume |

**Environment variables injected into the app container:**

```yaml
DATABASE_URL: postgresql://postgres:postgres@db:5432/todoapp
JWT_SECRET: your_jwt_secret_here
NODE_ENV: development
PORT: 5003
```

> The hostname `db` in `DATABASE_URL` refers to the Docker Compose service name, which Docker resolves internally.

**Start everything with:**

```bash
docker-compose up --build
```

---

## 7. Application Logic (`src/server.js`)

```js
import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5003;

// ESM equivalent of __dirname (not available natively in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/auth', authRoutes);
app.use('/todos', authMiddleware, todoRoutes); // All /todos routes are protected
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
```

> **`__dirname` in ESM:** Because the project uses `"type": "module"`, `__dirname` is not available by default. It must be reconstructed using `fileURLToPath` and `dirname`.

---

## 8. Authentication

### `authMiddleware.js` — JWT Guard

```js
import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.userId = decoded.id; // Attach user ID to request for downstream routes
        next();
    });
}
export default authMiddleware;
```

- The token is expected as a **raw** `Authorization` header value (not `Bearer <token>` format).
- On success, it attaches `req.userId` so route handlers know which user is making the request.

### `authRoutes.js` — Register & Login

**POST `/auth/register`**

1. Receives `{ username, password }` from request body.
2. Hashes password using `bcrypt.hashSync(password, 8)`.
3. Creates a `User` record via Prisma.
4. **Automatically creates a default Todo** (`"Hello :) Add your first todo!"`) for the new user.
5. Signs and returns a JWT valid for **24 hours**.

```js
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
res.json({ token })
```

**POST `/auth/login`**

1. Looks up the user by `username` with `prisma.user.findUnique`.
2. Returns `404` if user not found.
3. Compares passwords with `bcrypt.compareSync`.
4. Returns `401` if password is invalid.
5. Signs and returns a JWT on success.

---

## 9. Todo CRUD Routes (`todoRoutes.js`)

All routes are protected — `authMiddleware` runs first and populates `req.userId`.

| Method | Endpoint | Action |
|---|---|---|
| `GET` | `/todos` | Fetch all todos for the logged-in user |
| `POST` | `/todos` | Create a new todo |
| `PUT` | `/todos/:id` | Toggle `completed` status |
| `DELETE` | `/todos/:id` | Delete a specific todo |

**Key implementation details:**

- Every query filters by `userId: req.userId` — users can only see and modify **their own** todos.
- Update only toggles `completed`: `completed: !!completed` (coerces truthy/falsy values to a boolean).
- `parseInt(id)` is used when querying by `:id` because route params are always strings.

---

## 10. Testing with the REST Client (`todo-app.rest`)

The `.rest` file (used with the VS Code **REST Client** extension) contains pre-built HTTP requests:

```http
### Register
POST http://localhost:5003/auth/register
Content-Type: application/json

{ "username": "gilgamesh@gmail.com", "password": "123123123" }

---

### Login
POST http://localhost:5003/auth/login
Content-Type: application/json

{ "username": "gilgamesh@gmail.com", "password": "123123123" }

---

### Get todos (protected)
GET http://localhost:5003/todos
Authorization: <paste token here>

---

### Create todo
POST http://localhost:5003/todos
Authorization: <token>
Content-Type: application/json
{ "task": "coding the projects" }

---

### Update todo (mark complete)
PUT http://localhost:5003/todos/2
Authorization: <token>
Content-Type: application/json
{ "completed": 1 }

---

### Delete todo
DELETE http://localhost:5003/todos/2
Authorization: <token>
```

> The token from `/auth/login` or `/auth/register` is pasted directly into the `Authorization` header — **no `Bearer` prefix**.

---

## 11. Differences from Chapter 3

| Feature | Chapter 3 | Chapter 4 |
|---|---|---|
| Database | SQLite (in-memory, `node:sqlite`) | PostgreSQL (persistent, Docker) |
| ORM / DB Access | Raw SQL via `DatabaseSync` | Prisma ORM |
| Schema definition | SQL strings in `db.js` | `prisma/schema.prisma` |
| Auth token | JWT | JWT (same) |
| Deployment | Run locally | Dockerized (app + db) |
| DB persistence | ❌ Lost on restart | ✅ Persisted via Docker volume |

---

## Key Takeaways

1. **NVM** ensures Node 22 is used — required for built-in `--watch` and `--env-file` flags.
2. **Prisma** replaces raw SQL — schema-first approach with type-safe query builder.
3. **PostgreSQL** replaces in-memory SQLite — data is now persistent across restarts.
4. **Docker Compose** orchestrates both the app and database as two linked services.
5. **`authMiddleware`** injects `req.userId` into every protected request — routes never need to parse the token themselves.
6. **Default todo on register** — a nice UX touch: every new user immediately sees a todo item.
7. **`__dirname` must be reconstructed** in ESM modules using `fileURLToPath` + `dirname`.
8. **Prisma needs `openssl` on Alpine** — a critical Docker gotcha when using `node:alpine` images.
