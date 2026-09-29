# Experiment 13: User Registration and Login API

An Express and MongoDB/Mongoose authentication API using bcrypt password hashing and JWT-protected routes.

## Setup

1. Install Node.js 18 or newer and ensure MongoDB is running (or create a MongoDB Atlas database).
2. Copy `.env.example` to `.env`, then set `MONGO_URI` and a long, unique `JWT_SECRET`.
3. Install and run:

```bash
npm install
npm run dev
```

Use `npm start` for a normal server run. The API is available at `http://localhost:5000`.

## API tests

Register a user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"SecurePass123"}'
```

Log in:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"SecurePass123"}'
```

Fetch the protected profile (replace `YOUR_JWT` with the `token` returned by registration or login):

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT"
```

Successful register/login responses contain `{ "token": "...", "user": { ... } }`. The password is never included in API responses.
