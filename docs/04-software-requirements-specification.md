# Findit — Software Requirements Specification

**Status:** Initial draft. Distinguishes observed code from proposed requirements.

## Purpose and context
MERN-based community lost-and-found web application for an initial audience in Nepal:
- React/Vite browser client.
- Node.js/Express API.
- MongoDB accessed through Mongoose.

Client API base defaults to `http://localhost:5000/api`, configurable with `VITE_API_URL`. Server defaults to port `5000`; `MONGODB_URI` is required and `CLIENT_URL` is optional.

## Observed source behavior (not runtime-verified)
- `GET /api/health`: reports API status and MongoDB connection state.
- `GET /api/items`: lists active reports; supports type, category, and text search; newest first, limited to 100.
- `POST /api/items`: creates an item report.
- Item fields: title, description, type, category, color, location, dateOccurred, imageUrl, status, reportedBy.
- Types: `lost`, `found`.
- Categories: `electronics`, `wallet`, `keys`, `documents`, `clothing`, `bags`, `accessories`, `other`.
- Status values: `active`, `claimed`, `resolved`; default is `active`.
- Creation code does not visibly require authentication or set `reportedBy` from an authenticated user.

## Proposed functional requirements
- **FR-01:** Display active lost/found reports.
- **FR-02:** Allow report type selection, subject to the final account policy.
- **FR-03:** Require approved fields: title, description, type, category, location, date.
- **FR-04:** Validate required fields and allowed values server-side.
- **FR-05:** Filter by type and category.
- **FR-06:** Search report text.
- **FR-07:** Communicate loading, empty, success, and error states accurately.
- **FR-08:** Persist reports in MongoDB.
- **FR-09:** Return appropriate HTTP status codes and safe error messages.
- **FR-10:** Document local setup and environment variables.

## Proposed non-functional requirements
- **NFR-01 Security:** validate server-side; prevent unauthorized changes if editing is added.
- **NFR-02 Privacy:** collect/expose personal data only when justified by an approved flow.
- **NFR-03 Reliability:** handle API/database failures without claiming a report was saved.
- **NFR-04 Maintainability:** keep UI, services, routes, controllers, and models organized.
- **NFR-05 Compatibility:** support current mainstream desktop/mobile browsers; exact matrix TBD.
- **NFR-06 Performance:** measurable targets are unknown and must be agreed before launch.
- **NFR-07 Accessibility:** forms and navigation should be labeled and keyboard-usable.
- **NFR-08 Observability:** avoid logging secrets or unnecessary personal data.

## Open validation questions
Are past dates allowed? What location format is required? Should image URLs be allowed or should uploads be used? What field limits and sanitization rules are needed? What retention/deletion rules apply?

Authentication, verification, password recovery, roles, messaging, notifications, automated matching, moderation, analytics, hosting, service-level targets, and multilingual support remain unknown.
