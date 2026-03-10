# Chirpy Server

A production-ready RESTful backend API built with Node.js, Express, TypeScript, and PostgreSQL. Chirpy is a Twitter-like platform where users can post short messages called "chirps".

---

## Features

- User registration and authentication with hashed passwords (Argon2)
- JWT-based access tokens with refresh token rotation
- Token revocation support
- Create, read, and delete chirps
- Profanity filtering on chirp content
- Filter and sort chirps by author or date
- Chirpy Red membership upgrades via webhook
- API key authentication for third-party webhooks
- Automatic database migrations with Drizzle ORM

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | JWT + Argon2 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/EidJbehe/chirpy-server.git
cd chirpy-server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DB_URL=postgres://user:password@localhost:5432/chirpy
PLATFORM=dev
JWT_SECRET=your_jwt_secret_here
POLKA_KEY=your_polka_api_key_here
```

Generate a secure JWT secret:

```bash
openssl rand -base64 64
```

### Database Setup

```bash
# Generate and apply migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Running the Server

```bash
npm run dev
```

Server runs at `http://localhost:8080`

---

## API Endpoints

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users` | Register a new user | None |
| PUT | `/api/users` | Update email and password | Bearer Token |
| POST | `/api/login` | Login and receive tokens | None |
| POST | `/api/refresh` | Get a new access token | Refresh Token |
| POST | `/api/revoke` | Revoke a refresh token | Refresh Token |

### Chirps

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/chirps` | Get all chirps | None |
| GET | `/api/chirps?authorId={id}` | Get chirps by author | None |
| GET | `/api/chirps?sort=asc\|desc` | Get chirps sorted by date | None |
| GET | `/api/chirps/:chirpId` | Get a single chirp | None |
| POST | `/api/chirps` | Create a chirp | Bearer Token |
| DELETE | `/api/chirps/:chirpId` | Delete a chirp (owner only) | Bearer Token |

### Webhooks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/polka/webhooks` | Handle Polka payment events | API Key |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/metrics` | View server hit count |
| POST | `/admin/reset` | Reset database (dev only) |

---

## Authentication Flow

```
1. POST /api/users       → Create account
2. POST /api/login       → Receive { token, refreshToken }
3. Use token in header   → Authorization: Bearer <token>
4. POST /api/refresh     → Get new token when expired
5. POST /api/revoke      → Logout / invalidate session
```

---

## Example Requests

### Register a User

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'
```

### Login

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'
```

### Create a Chirp

```bash
curl -X POST http://localhost:8080/api/chirps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"body":"Hello, Chirpy!"}'
```

---

## Project Structure

```
src/
├── index.ts          # Express server and all routes
├── auth.ts           # JWT, password hashing, API key helpers
├── config.ts         # Environment configuration
└── db/
    ├── index.ts      # Database connection
    ├── schema.ts     # Table definitions
    └── queries/
        ├── users.ts
        ├── chirps.ts
        └── refreshTokens.ts
```

---

## License

MIT
