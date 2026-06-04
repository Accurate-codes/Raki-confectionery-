# Rakis Confectionery - Database Security Specification

This document details the Zero-Trust data access requirements, invariants, and validation rules for the Rakis Confectionery database (Firestore).

## Data Invariants & Zero-Trust Logic

1. **Self-Managed Identity**: Users can only create or read their own orders and reviews.
2. **Catalog Integrity**: Confectionery catalog menu items (`/menu/{itemId}`) can only be mutated by verified administrators (hardcoded to the store owner's verified Google account: `ogidanrighteous13@gmail.com`).
3. **Admin Exclusivity**: Access to client quote requests and contact messages (`/messages/{messageId}`) is strictly exclusive to the admin. No regular customer or guess user can read other users' messages.
4. **Validation Guarding**: Every document write must validate string sizes, IDs conform to matches, and avoid Denial-of-Wallet attacks.
5. **Review Filtering**: Customer reviews are initially pending (`approved = false`) upon submission to prevent spam or inappropriate postings on the public galley. Only an administrator can approve and publish a review.

---

## The "Dirty Dozen" Malicious Payloads

The following specific JSON payloads are mathematically blacklisted by the compiled Fortress rules:

1. **Payload 1: Admin Identity Spoofing (Catalog Creation Attempt)**
   - Attempt: Random user creates a menu item with false claims.
   - Rejected: Prevented by `isAdmin()` verification.

2. **Payload 2: Order Creation UID Hijacking**
   - Attempt: User `hacker123` submits an order setting `userId = "victim456"`.
   - Rejected: Prevented by `incoming().userId == request.auth.uid`.

3. **Payload 3: Review Auto-Approval Attack**
   - Attempt: User submits a review setting `approved = true` to appear immediately.
   - Rejected: Prevented by strict type validation matching `incoming().approved == false` on client creation.

4. **Payload 4: Catalog Overwrite & Defacement**
   - Attempt: Signed-in non-admin modifies a cake basePrice to negative values or changes titles.
   - Rejected: Only `isAdmin()` is permitted to write inside `/menu`.

5. **Payload 5: Message Snooping**
   - Attempt: Signed-in customer attempts a broad list query of `/messages` to download client communications.
   - Rejected: Read permission blocked for regular clients, only allowed for verified admins.

6. **Payload 6: Guest Order Hijacking**
   - Attempt: Guest user tries to read an order belonging to user `victim456`.
   - Rejected: Enforced ownership check `resource.data.userId == request.auth.uid`.

7. **Payload 7: Unlimited Length SQL Injection-type ID Poisoning**
   - Attempt: Injecting huge (1MB) randomized strings into reference paths or ids.
   - Rejected: Protected by `isValidId(id)` limit checks (size <= 128).

8. **Payload 8: Negative Price Order Submission**
   - Attempt: Submitting a valid order JSON with a manipulated negative totalAmount.
   - Rejected: Blocked by `incoming().totalAmount >= 0`.

9. **Payload 9: State Shortcutting (Bypassing Order Workflow)**
   - Attempt: Creating an initial order directly in `status = "completed"` without payment/approval.
   - Rejected: Enforced `incoming().status == "pending"` on create.

10. **Payload 10: Unauthorized Order Status Manipulation**
    - Attempt: A customer marks their order as `confirmed` or `completed` themselves via SDK.
    - Rejected: Client update is key-restricted. Customers can *only* update the `status` field to `cancelled`, and only if it was `pending`.

11. **Payload 11: Non-existent Parental Cross-Reference**
    - Attempt: Submitting a review without a valid `userId` reference.
    - Rejected: Strictly verified against `request.auth.uid`.

12. **Payload 12: Denial-of-Wallet Payload Size Exploit**
    - Attempt: Submitting extremely long fields (e.g. 500kb comment, name, or orderNotes).
    - Rejected: Protected by explicit size boundaries on every string (e.g. name length <= 256, comment length <= 2000).
