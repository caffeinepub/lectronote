# LectroNote

## Current State
- Login page with two tabs: Login with Class ID and Register New Class
- Register flow: enter class name + year, backend generates a unique Class ID
- Class dashboard with calendar; today = record class, past = view periods with bilingual summaries + hear button
- Backend has authorization; `registerClass` currently requires `#user` permission

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `registerClass` backend function: remove the authorization check so that any caller (including anonymous/guest) can register a new class. This is required because registration happens before a user identity is established.

### Remove
- Nothing

## Implementation Plan
1. Regenerate the Motoko backend with `registerClass` accepting calls from any caller (no auth guard), while all other endpoints keep their existing auth requirements.
