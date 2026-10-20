# Findit — User Stories and Acceptance Criteria

**Status:** Initial draft; review before treating as approved requirements.

## US-01 Browse reports
As a community member, I want to browse active lost/found reports so I can see whether one relates to an item I lost or found.

Acceptance:
- Show reports returned by the API.
- Distinguish loading, failure, and no-results states.
- Show available identifying details.
- Do not present failed requests as successful loads.

## US-02 Filter reports
As a community member, I want to filter by lost/found type and category.

Acceptance:
- Selecting a filter refreshes results.
- “All” clears the relevant filter.
- Empty results are explained clearly.

## US-03 Search reports
As a community member, I want to search report text.

Acceptance:
- Search covers fields approved for discovery.
- Empty search does not exclude all reports unexpectedly.
- Failures are communicated clearly.

## US-04 Report a lost item
As a person who has lost an item, I want to submit a structured report so the community can discover it.

Acceptance:
- The form captures approved required fields.
- The server validates required fields and allowed values.
- Success appears only after API confirmation.
- The new report appears after refresh.

## US-05 Report a found item
As a person who found an item, I want to submit a found-item report so its owner may discover it.

Acceptance:
- Type is saved as found.
- Required fields are validated.
- The UI shows an accurate result.

## US-06 Contact a reporter / arrange handover
As a person who believes a report matches my item, I want a safe way to follow up.

**Blocked:** no contact mechanism is confirmed in the inspected implementation. Product decision required.

## US-07 Resolve a report
As an authorized person, I want a resolved item to stop appearing as active.

**Blocked:** define who may change status and what “resolved” means.

Accounts, direct chat, notifications, image uploads, automatic matching, maps, and administration are not approved requirements yet.
