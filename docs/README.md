# Findit

Findit is a community lost-and-found web application intended initially for people in Nepal.

## Technology
**MERN only:** MongoDB, Express.js, React, and Node.js. Current supporting tools include Mongoose, Vite, and Tailwind CSS.

## Current status
Early development. The repository contains code for a community board, report form, item listing/search/filter API, MongoDB connection, and Item schema. Runtime behavior and end-to-end tests are not yet verified.

## Repository structure
- `client/` — React/Vite frontend
- `server/` — Node.js/Express backend
- `docs/` — project vision, requirements, architecture, implementation status, and roadmap

## Local setup
1. Install a compatible Node.js version.
2. Install client dependencies: `cd client && npm install`.
3. Install server dependencies: `cd server && npm install`.
4. Configure `server/.env` with `MONGODB_URI`, optional `PORT` (default `5000`), and optional `CLIENT_URL` (default `http://localhost:5173`).
5. Optionally configure `client/.env` with `VITE_API_URL` (default `http://localhost:5000/api`).
6. Start server with `npm run dev` from `server/`.
7. Start client with `npm run dev` from `client/`.

Use only a development database while testing. Never commit `.env` files or real credentials. These steps are proposed from package scripts and configuration; they have not been run as part of the documentation audit.

## API baseline
- `GET /api/health`
- `GET /api/items`
- `POST /api/items`

See [`docs/09-api-specification.md`](docs/09-api-specification.md).

## Documentation
Start with [`docs/01-project-charter.md`](docs/01-project-charter.md), then review product vision, MVP scope, requirements, architecture, implementation status, API specification, decisions, and roadmap.

## Important
This README describes the current code baseline, not a claim that the application is production-ready. See `docs/07-implementation-status.md` for the audit and verification checklist.
