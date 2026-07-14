# Security Specification: Atulya Gold Firestore

This document describes the security invariants, validation rules, and attack payloads used to verify our Zero-Trust Firestore Security model.

## 1. Data Invariants

1. **Product Catalog**: Read-only for general public. Write/Modify operations are only allowed if authorized (either open for administration or restricted to admin role).
2. **Customer Orders**: Placed by customers. Standard users can create orders. Standard users can query their own orders filtered by `customerEmail` matching their authenticated email.
3. **Product Reviews**:
   - Any user (authenticated or unauthenticated, depending on custom rules) can read product reviews.
   - Creating/Writing a review requires the writer's email to match their active authentication credentials if they are logged in.
   - Ratings must be an integer between 1 and 5.
   - Comments must be non-empty and limited in size to prevent wallet/storage denial-of-service attacks.
   - A user cannot modify or delete reviews posted by other patrons.

---

## 2. The "Dirty Dozen" Payloads (Malicious Writes Rejected by Rules)

The following payloads represent illegal database mutations designed to test our attribute boundaries and must be rejected by Firestore Security Rules.

### Product Collection Exploits
1. **Catalog Price Overwrite (Anonymous Modification)**
   ```json
   {
     "id": 1,
     "title": "Malicious Gold Coin",
     "price": 1,
     "category": "coins",
     "material": "gold",
     "image": "https://fakeimage.url"
   }
   ```
2. **Spam Field Injection (Shadow Key Attack)**
   ```json
   {
     "id": 2,
     "title": "Diamond Ring",
     "price": 185000,
     "category": "rings",
     "material": "diamond",
     "image": "https://images.unsplash.com/photo-1603974374373-9a8a0a0d9f11",
     "ghost_admin_field": true
   }
   ```

### Order Collection Exploits
3. **Order Status Tampering (State Hijack)**
   ```json
   {
     "id": "order-1234",
     "customerName": "John Doe",
     "customerEmail": "victim@gmail.com",
     "status": "Delivered",
     "paymentStatus": "Paid"
   }
   ```
4. **Order Scraping (Unauthorized Reads of Other Customers)**
   ```javascript
   // Attempting to query orders where customerEmail is not matching current user
   db.collection("orders").where("customerEmail", "==", "anotheruser@gmail.com")
   ```

### Review Collection Exploits
5. **Rating Over the Limit (> 5 Stars)**
   ```json
   {
     "id": "rev-1",
     "productId": 1,
     "name": "Spammer",
     "email": "spammer@gmail.com",
     "rating": 10,
     "text": "Overrated",
     "date": "2026-07-11T04:00:00Z",
     "avatar": "https://avatar.url"
   }
   ```
6. **Rating Under the Limit (< 1 Star)**
   ```json
   {
     "id": "rev-2",
     "productId": 1,
     "name": "Spammer",
     "email": "spammer@gmail.com",
     "rating": 0,
     "text": "Terrible",
     "date": "2026-07-11T04:00:00Z",
     "avatar": "https://avatar.url"
   }
   ```
7. **Identity Spoofing (Writing review as another user's email)**
   ```json
   {
     "id": "rev-3",
     "productId": 1,
     "name": "Attacker",
     "email": "victim@gmail.com",
     "rating": 5,
     "text": "Stolen Identity",
     "date": "2026-07-11T04:00:00Z",
     "avatar": "https://avatar.url"
   }
   ```
8. **Wallet Exhaustion Attack (Massive review text payload)**
   ```json
   {
     "id": "rev-4",
     "productId": 1,
     "name": "Attacker",
     "email": "attacker@gmail.com",
     "rating": 4,
     "text": "[1MB of garbage text...]",
     "date": "2026-07-11T04:00:00Z",
     "avatar": "https://avatar.url"
   }
   ```
9. **Review Sibling Tampering (Modifying someone else's review text)**
   ```json
   {
     "id": "existing-review-id",
     "text": "Hacked review text content"
   }
   ```
10. **ID Character Poisoning (Junk characters in document path)**
    ```javascript
    db.collection("reviews").doc("$$%^HACK_ME_NOW_WITH_PII_DATA_$$%")
    ```
11. **Negative Price/Numeric Fields Injection**
    ```json
    {
      "id": 15,
      "title": "Exploit Ring",
      "price": -500,
      "category": "rings",
      "material": "gold",
      "image": "https://image.url"
    }
    ```
12. **System Outcome Lock Alteration**
    ```json
    {
      "id": "order-abc",
      "status": "Customizing"
    } // Modifying a terminal "Delivered" order status back to customization
    ```

---

## 3. Test Runner Specification

The Firestore security rules will be applied and validated using unit testing principles, ensuring any of the above operations are caught, rejected, and result in a `PERMISSION_DENIED` status.
