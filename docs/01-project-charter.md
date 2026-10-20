# Findit — Project Charter

**Status:** Initial draft | **Last reviewed:** 2026-10-20  
**Repository:** https://github.com/irfanalam13/findit

## Project summary
Findit is a community lost-and-found web application intended initially for people in Nepal. It aims to help people report lost belongings, report items they have found, and discover relevant community reports.

## Problem statement
Information about lost belongings can be scattered across people, places, and communication channels. Findit will provide a shared place to publish and search lost/found reports. This initial framing should be validated with intended users.

## Confirmed decisions
- Product direction: community lost-and-found.
- Initial target audience: Nepal.
- First implementation priority: lost/found reporting workflow.
- Technology constraint: MERN only — MongoDB, Express.js, React, Node.js.
- Use the existing repository as the implementation baseline.
- Prepare documentation before the next major coding phase.

## Initial objectives
1. Document the product direction and open questions.
2. Verify the current report creation and browsing workflow.
3. Define a small, testable MVP.
4. Establish requirements, architecture, API contracts, and acceptance criteria.
5. Resume implementation through small, tested increments.

## Proposed success measures (not yet approved)
- Valid lost/found reports can be submitted.
- Users can browse and search reports.
- Invalid submissions and server failures are handled clearly.
- Reports persist in MongoDB.
- Core flows pass repeatable acceptance checks.

Launch date, budget, team, numeric targets, and operating model are unknown.

## Scope boundaries
Initial focus: community reports and their discovery. Authentication, direct messaging, notifications, image uploads, automatic matching, moderation workflows, maps, and admin tools are not confirmed requirements. Decide on each before adding it to the MVP.

## Risks and assumptions
- User journey and trust/safety rules are not fully specified.
- Code has not been runtime-tested in this documentation pass.
- Location and identifying details may be sensitive; data minimization needs explicit decisions.
- Hosting, retention, moderation responsibility, and support ownership are unknown.

## Approval checklist
- [ ] Problem and target users validated
- [ ] MVP features and non-goals approved
- [ ] Privacy and safety expectations agreed
- [ ] Acceptance and release criteria approved
