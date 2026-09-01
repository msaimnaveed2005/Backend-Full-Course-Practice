# Chapter 3 — Building a Full-Stack To-Do App with Node, Express & SQLite

## 1. Project Overview

Chapter 3 extends the introductory Chapter 2 project into a more complete backend application, built with **Node.js**, **Express**, and Node's built-in **SQLite** support (`node:sqlite`).

The finished application is a full-stack to-do app that:

- Serves a website directly from the backend
- Supports user registration and login
- Stores users and to-do items in SQLite
- Uses authentication to protect user-specific routes
- Lets users create, view, update, and delete to-dos
- Separates server, database, middleware, and route logic into organized files

---

## 2. Required Tools and Node Version

The course uses:

- **Visual Studio Code** — code editor
- **Node.js** — JavaScript runtime
- **NVM (Node Version Manager)** — to switch between Node versions
- **Docker** — introduced here but developed more fully in Chapter 4

**A note on the Node version:** `node:sqlite` is an experimental module that Node.js introduced in **v22.5.0** (it required the `--experimental-sqlite` flag until v22.13/23.4, and has since moved to release-candidate status in later versions). If your source material says to run `nvm use 20.2`, double-check it — Node 20.2 predates the SQLite module and won't have it available. You likely want something like:

```bash
nvm use 22
```

Check your active version at any time with:

```bash
node -v
```

---

## 3. Initializing the Project

Create a new project folder and initialize it:

```bash
cd ..
cd chapter3
npm init -y
```

- `cd ..` moves up one directory level (note the space — `cd..` without it will error in most shells).
- `cd chapter3` enters the new project directory.
- `npm init -y` generates a `package.json` file, which acts as the project's manifest — describing the project and tracking its dependencies and configuration.

---

## 4. Folder Structure

The project is organized to keep `server.js` from growing unwieldy:

```text
chapter3/
├── package.json
├── package-lock.json
├── .env
├── todo-app.rest
├── public/
└── src/
    ├── server.js
    ├── db.js
    ├── middleware/
    │   └── authMiddleware.js
    └── routes/
        ├── authRoutes.js
        └── todoRoutes.js
```

| Path | Purpose |
|---|---|
| `src/` | Application source code — server, database config, middleware, routes |
| `src/server.js` | Central hub: configures Express, registers middleware, connects routes, starts the server |
| `src/db.js` | SQLite database configuration and database logic |
| `src/middleware/` | Logic that runs between an incoming request and its final route handler (here, authentication) |
| `src/routes/authRoutes.js` | Registration and login endpoints |
| `src/routes/todoRoutes.js` | To-do CRUD endpoints |
| `public/` | Frontend assets (HTML, CSS, client-side JS) served to the browser |
| `.env` | Environment variables (secrets, config) kept out of version control |
| `todo-app.rest` | Request definitions for the VS Code REST Client extension, used to test API endpoints |

---

## 5. Express and Dependencies

Express is a Node package that simplifies server development. Node can create a server on its own, but Express adds convenient abstractions for routing, requests, responses, and static file serving.

Installed packages are recorded in `package.json` under `dependencies`, so another developer (or a production environment) can inspect the file and install everything the project needs. The actual package code lives in `node_modules/`, which you generally shouldn't edit by hand.

---

## 6. Serving the Frontend

Express serves static frontend files via its built-in static middleware:

```js
app.use(express.static(path.join(__dirname, "../public")));
```

Because `server.js` lives inside `src/`, the `../public` path steps up one level and into `public/`.

Request flow for the homepage:

1. The server sends the HTML file.
2. The browser parses it and finds references to CSS/JS files.
3. The browser requests those assets.
4. Express serves them from `public/`.
5. The browser applies the CSS and executes the JavaScript.

---

## 7. Database Design

SQLite (**S**tructured **Q**uery **L**anguage database) is a lightweight, file-based SQL database. This project uses two tables:

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key, auto-increment |
| `username` | text | Must be unique |
| `password` | text | Stores a **hashed** password, never the original |

A primary key gives each record a unique identity that other tables can reference.

### `todos`

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `user_id` | Foreign-key-style reference to `users.id` |
| (text field) | The to-do's content |
| (boolean/flag field) | Completion state |

```text
users.id  ←  todos.user_id
```

This relationship lets the app filter to-dos so an authenticated user only ever sees their own.

---

## 8. Registration Flow

1. Client sends a JSON request with `username` and `password`.
2. Express exposes the body via `req.body`; extract the fields with destructuring:
   ```js
   const { username, password } = req.body;
   ```
3. Hash the password (never store it in plain text).
4. Prepare an `INSERT` query using placeholders — a **prepared statement** separates the SQL structure from user-supplied values, which protects against SQL injection.
5. Run the query with the username and hashed password.
6. Create a default to-do item for the new user, so they see something on first login.
7. Return a response to the client.

---

## 9. Login Flow

1. Client sends a JSON request with `username` and `password` to the login endpoint.
2. The server extracts both fields from `req.body`.
3. It looks up the username in the database.
4. It retrieves the stored password hash.
5. It compares the submitted password against that hash using **bcrypt** — bcrypt can verify a match without ever needing the original plaintext password back.
6. If the user doesn't exist or the password doesn't match, the request is rejected.
7. If credentials are valid, the server creates and returns an authentication token.

---

## 10. Authentication Middleware

Middleware protects routes that require a logged-in user:

```text
Request
   ↓
Authentication middleware
   ↓
Verify token
   ↓
Attach user ID to request
   ↓
To-do route handler
```

Steps:

1. Read the token from the incoming request.
2. Verify the token is valid.
3. Decode the user ID embedded in the token.
4. Attach that user ID to the request object.
5. Call `next()` to hand off to the route handler.

If verification fails, the middleware short-circuits the request instead of calling `next()`, so protected data is never reached. Attaching the user ID lets downstream to-do routes know exactly whose data they're working with.

---

## 11. To-Do API Operations

| Method | Purpose |
|---|---|
| `GET` | Retrieve data |
| `POST` | Create data |
| `PUT` | Modify existing data |
| `DELETE` | Remove data |

The REST Client extension lets you test these endpoints directly, without going through the frontend.

- **`GET`** — Returns the authenticated user's to-dos, filtered by the user ID the middleware attached to the request.
- **`POST`** — Creates a to-do, combining the submitted `req.body` data with the authenticated user's ID.
- **`PUT`** — Modifies an existing to-do (e.g., flipping `completed` to `true`).
- **`DELETE`** — Removes a to-do. **Always send a response after deleting** — otherwise the client can appear to hang even though the deletion succeeded.

---

## 12. HTTP Status Codes

Express defaults to status `200` when no custom status is set.

Set one explicitly like this:

```js
res.status(201).send("Created");
```

| Code | Meaning |
|---|---|
| `200` | Request succeeded |
| `201` | Resource created |
| `400` | Client sent invalid data |
| `401` | Authentication required or failed |
| `404` | Resource not found |
| `500` | Server-side error |

Every response should carry both the response data **and** a status code describing the outcome.

---

## 13. Frontend/Backend Relationship

```text
Browser
  ↓  frontend JS sends a request
Express endpoint
  ↓
Authentication middleware
  ↓
Database operation
  ↓
JSON response
  ↓
Frontend updates the page
```

- **Frontend**: HTML, CSS, and JS running in the browser — the interface the user interacts with.
- **Backend**: Runs on the server, listens for requests, and handles authentication, database operations, and responses.

---

## 14. Key Takeaways

1. Use NVM to select the Node version a project requires.
2. Initialize projects with `npm init -y`.
3. Use Express to simplify server and route development.
4. Separate responsibilities into source, routes, middleware, and database files.
5. Use SQLite for lightweight relational storage.
6. Use primary keys to uniquely identify records.
7. Use foreign-key-style fields (e.g., `todos.user_id`) to associate data with users.
8. Hash passwords — never store them directly.
9. Use authentication middleware to protect private endpoints.
10. Use prepared SQL queries for any user-provided values.
11. Use HTTP methods consistently: `GET`, `POST`, `PUT`, `DELETE`.
12. Always send a response after handling a request.
13. Serve frontend assets through Express's static middleware.
14. Use a REST client to test endpoints independently of the frontend.

Chapter 3 marks the shift from a basic Node server to a structured full-stack application with authentication, persistent data, protected routes, and a working frontend.
