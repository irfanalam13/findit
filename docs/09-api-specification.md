# Findit — API Specification (Observed Baseline)

**Status:** Initial draft from source inspection; not a complete OpenAPI contract and not runtime-verified.

Local client base URL: `http://localhost:5000/api`.

## GET /api/health
Observed response shape:
```json
{
  "success": true,
  "message": "FindIt API is running",
  "database": "connected"
}
```
Database may also be `disconnected`.

## GET /api/items
Observed query parameters:
- `type`: `lost` or `found`; other values do not apply a type filter.
- `category`: category string.
- `search`: searches title, description, location, and color.

Observed behavior:
- Only `status: active` reports are returned.
- Sorted by `createdAt` descending.
- Limited to 100 reports.
- Response shape: `{ "success": true, "count": number, "items": [...] }`.

## POST /api/items
Content type: JSON. Fields read from body:
- `title`, `description`, `type`, `category`, `color`, `location`, `dateOccurred`, `imageUrl`.

Controller explicitly checks title, description, location, and date presence. Mongoose schema additionally requires type/category and validates enums/lengths. Test all malformed payload behavior.

Observed success: HTTP 201 with `{ "success": true, "item": ... }`.
Observed errors: missing controller-required fields -> 400; Mongoose validation errors -> 400; other errors go to general error handler.

## Decisions still required
Stable error schema/codes, pagination, authentication/authorization, update/delete/claim/resolve/moderation endpoints, image upload strategy, rate limiting, API versioning, and automated contract tests.
