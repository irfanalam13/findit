# Findit — System Architecture Baseline

**Status:** Inferred from source structure; runtime/deployment unverified.

## Technology constraint
MERN only:
- MongoDB — document database.
- Express.js — HTTP API framework.
- React — browser UI.
- Node.js — server runtime.

Current supporting tools include Vite, Mongoose, Tailwind CSS, and fetch-based API calls.

## Logical architecture
```text
Browser
  React + Vite
      | HTTP / JSON
      v
Node.js + Express API
  Routes -> Controllers -> Mongoose models
      |
      v
MongoDB

GET  /api/health
GET  /api/items
POST /api/items
```

## Selected repository structure
- `client/src/pages/HomePage.jsx`: main community board.
- `client/src/components/`: UI components.
- `client/src/features/items/`: item hooks/services.
- `client/src/lib/api.js`: API request helper.
- `server/src/server.js`: Express setup/startup.
- `server/src/config/db.js`: MongoDB connection.
- `server/src/routes/itemRoutes.js`: item routes.
- `server/src/controllers/itemController.js`: list/create handlers.
- `server/src/models/Item.js`: item schema.

## Observed Item data model
Title, description, type, category, color, location, dateOccurred, imageUrl, status, nullable `reportedBy` reference, and timestamps. A User model was not found in the inspected model directory; the reference does not prove user accounts exist.

## Configuration
Server: `MONGODB_URI` required; `PORT` defaults to 5000; `CLIENT_URL` defaults to `http://localhost:5173`.
Client: `VITE_API_URL` overrides default `http://localhost:5000/api`.

Never commit actual secrets. Use placeholder values in `.env.example`.

## Concerns to verify
- Report creation appears unauthenticated; decide whether guest submission is intended.
- `reportedBy` defaults to null; do not treat it as verified ownership.
- An image URL field exists, but upload/storage infrastructure is not confirmed.
- Review server validation, rate limiting, spam prevention, security headers, and production CORS.
- Tests and deployment topology are unknown.

## Proposed architecture rules
Validate client input again on the server, keep secrets in environment variables, return predictable API errors, and add only components needed for approved requirements.
