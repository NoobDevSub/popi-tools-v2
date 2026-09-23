# POPI Tools Firestore Security Specification

## 1. Data Invariants
- **Identity Invariant**: A user document in `/users/{userId}` can only be read or written by the user whose `request.auth.uid == userId`.
- **Integrity Invariant**: During creation and update, `uid` and `userId` must strictly match `request.auth.uid`.
- **Immutability Invariant**: `createdAt` cannot be modified after initial document creation.
- **Relational Ownership**: Subcollections under `/users/{userId}/notes/{noteId}` must strictly belong to the parent `{userId}`, where `{userId} == request.auth.uid`.
- **Timestamp Integrity**: `createdAt` and `updatedAt` timestamps must evaluate to `request.time`.
- **Anti-Shadow-Fields**: All writes must strictly adhere to the allowed fields schema.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated User Read**: An unauthenticated request attempting to `get` `/users/user123`.
2. **Identity Spoofing on User Profile**: Authenticated as `userA`, trying to write `uid: "userB"` into `/users/userA`.
3. **Cross-User Profile Hijack**: Authenticated as `userA`, attempting to overwrite `/users/userB`.
4. **CreatedAt Mutation**: Attempting to alter `createdAt` on an existing `/users/userA` profile.
5. **Ghost Field Injection**: Adding an unpermitted field `isAdmin: true` during profile update.
6. **Oversized String Attack**: Submitting a `displayName` containing a 20KB string to exhaust resources.
7. **Invalid Path Injection**: Supplying a malicious path variable like `/users/../../../maliciousDoc`.
8. **Orphaned Note Creation**: Attempting to create a note at `/users/userB/notes/note1` while signed in as `userA`.
9. **Mismatched Note Owner**: Authenticated as `userA`, creating a note with `userId: "userC"`.
10. **Timestamp Tampering**: Submitting a client-provided past timestamp `createdAt: "1999-01-01T00:00:00Z"`.
11. **Negative/Unverified List Scraping**: An unauthenticated or cross-tenant query attempting blanket `list` on `/users`.
12. **Oversized Content Injection**: Submitting a note `content` exceeding 1000 characters.

## 3. Test Runner
Refer to `tests/firestore.rules.test.ts` for full verification asserting `PERMISSION_DENIED` on all 12 payloads.
