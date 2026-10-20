# Findit — Decision Log and Open Questions

**Last updated:** 2026-10-20

## Confirmed decisions

| ID | Decision | Status |
|---|---|---|
| D-01 | Community lost-and-found platform | Confirmed |
| D-02 | Initial target audience is people in Nepal | Confirmed |
| D-03 | First priority is the lost/found reporting workflow | Confirmed |
| D-04 | MERN stack only | Confirmed |
| D-05 | Existing GitHub repository is the implementation baseline | Confirmed |
| D-06 | Prepare initial VVI docs before major coding resumes | Confirmed |

## Unknowns requiring decisions

| ID | Question | Why it matters |
|---|---|---|
| Q-01 | Can guests submit reports, or are accounts required? | Identity, ownership, spam controls, API design |
| Q-02 | How can a potential owner contact a finder safely? | Essential for reuniting belongings |
| Q-03 | Who can edit, claim, resolve, or remove reports? | Authorization and lifecycle |
| Q-04 | Are photos required for MVP? | Upload/storage and privacy design |
| Q-05 | What location format and geographic scope are needed? | Search and usability |
| Q-06 | Which interface languages are required? | Copy and localization |
| Q-07 | How are spam, fraud, and sensitive items handled? | Trust and safety |
| Q-08 | Should reports expire, archive, or be deleted? | Data lifecycle |
| Q-09 | Where will the app be hosted? | Deployment, CORS, secrets, cost |
| Q-10 | What are launch date, budget, team, and success targets? | Delivery planning |

## Working rules
- Do not mark proposed features confirmed without an explicit decision.
- Do not mark source code as working until it passes a repeatable test.
- Record date and evidence for implementation-status changes.
- Keep the MERN-only constraint unless the project owner changes it.
