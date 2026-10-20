# Findit — MVP Scope

**Status:** Proposed baseline for review, not a final feature commitment.

## Candidate P0 scope
- Browse active community reports.
- Create a lost-item report.
- Create a found-item report.
- Capture title, description, type, category, location, and date.
- Filter by lost/found type and category.
- Search report text.
- Show loading, empty, validation, success, and error states.
- Persist reports in MongoDB.
- Provide a health endpoint.
- Validate inputs on the server.
- Add repeatable acceptance checks for the core flow.

Most of these have partial code in the repository; end-to-end behavior is not verified.

## P1 — decide after the core flow is verified
Potential enhancements requiring product approval:
- Image upload or hosting.
- Editing, claiming, and resolving reports.
- Accounts and reporter ownership.
- Contact/handover workflow.
- Duplicate detection or report matching.
- Moderation and abuse controls.

Do not treat this list as approved scope.

## Out of scope until approved
Personal inventory tracking, marketplace/payment/delivery features, native mobile apps, AI matching, real-time chat, push notifications, and maps/geolocation tracking.

## Draft acceptance criteria
1. Valid lost/found reports can be submitted and saved.
2. Newly created reports appear after refresh.
3. Type, category, and text search filters return appropriate results.
4. Invalid required fields are rejected with understandable errors.
5. Database/API failures do not produce false success messages.
6. Loading and no-results states are handled.
7. Local setup is documented.
8. Core tests can be repeated from a clean development environment.

## Release blockers to resolve
Guest/authenticated submission, safe contact and handover, moderation/abuse handling, image strategy, deployment configuration, and privacy/retention expectations.
