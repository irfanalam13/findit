# Findit — Development Roadmap

**Status:** Proposed sequence; dates and estimates are not approved.

## Phase 1 — Establish the baseline
- [ ] Review charter, vision, and MVP scope.
- [ ] Decide guest versus authenticated reporting.
- [ ] Define safe contact, handover, and resolution rules.
- [ ] Review privacy and moderation needs.
- [ ] Mark requirements approved, deferred, or rejected.

**Exit:** MVP scope and critical policy decisions are documented.

## Phase 2 — Verify existing code
- [ ] Install client/server dependencies from lockfiles.
- [ ] Configure local environment variables using placeholders.
- [ ] Connect development MongoDB.
- [ ] Start API and client.
- [ ] Test health, creation, browsing, filters, and search.
- [ ] Run lint/build commands and record failures.
- [ ] Fix existing core-flow defects before major additions.

**Exit:** Core workflow runs locally and known failures are documented.

## Phase 3 — Harden reporting MVP
- [ ] Define server-side validation and error conventions.
- [ ] Add tests for report creation, invalid input, filters, and search.
- [ ] Verify dates, field limits, enums, and search behavior.
- [ ] Check loading, empty, success, and failure UX.
- [ ] Decide image strategy if needed.
- [ ] Address basic abuse prevention and safe data handling.

**Exit:** Core acceptance criteria pass repeatably.

## Phase 4 — Trust and safety
- [ ] Decide account policy.
- [ ] Define contact and handover flow.
- [ ] Define who can edit, claim, resolve, or remove reports.
- [ ] Define moderation, spam/abuse handling, and retention.
- [ ] Implement only approved workflows.

## Phase 5 — Release preparation
- [ ] Choose hosting and production MongoDB setup.
- [ ] Configure production environment variables and CORS.
- [ ] Document deployment and rollback.
- [ ] Verify production build and smoke tests.
- [ ] Prepare appropriate privacy and usage information.
- [ ] Test with a small group of intended users in Nepal.
- [ ] Record blockers and obtain launch approval.

**Prioritization rule:** Fix core-flow defects before advanced features. Do not introduce non-MERN application frameworks. Keep optional capabilities out of MVP until confirmed.
