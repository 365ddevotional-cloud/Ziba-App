# Manual Test Checklist: Trip Coordinator + Rideshare MVP

## Prerequisites
- Server running (`npm run dev`)
- Access to browser dev tools (Network tab)
- Database reset or fresh state recommended for clean testing

---

## A) TRIP COORDINATOR FLOW

### Test 1: Sign Up as Trip Coordinator

**UI Steps:**
1. Navigate to: `http://localhost:5173/rider/register` (or your dev URL)
2. Fill registration form:
   - Full Name: `Test Coordinator`
   - Email: `coordinator@test.com` (unique email)
   - Password: `test123`
   - Confirm Password: `test123`
   - Phone: `+2348012345678`
   - City: `Lagos` (optional)
   - **IMPORTANT:** Select `Trip Coordinator` from user type dropdown
3. Click `Create Account` button

**Expected Result:**
- Redirect to `/coordinator/home`
- User created with `userType: "TRIP_COORDINATOR"`

**API Verification:**
```bash
# Check user was created (if you have direct DB access or API)
GET /api/rider/me
# Response should include: "userType": "TRIP_COORDINATOR"
```

---

### Test 2: Verify Phone Number

**UI Steps:**
1. On Coordinator Dashboard (`/coordinator/home`)
2. If phone is not verified, you should see a yellow banner: "Phone verification required"
3. Click `Verify Phone` button in the banner

**API Verification:**
```bash
# Direct API call (optional)
POST /api/auth/verify-phone
Headers: { "Content-Type": "application/json" }
Body: {} (empty)
Credentials: include (session cookie)

# Expected Response:
{
  "message": "Phone verified",
  "phoneVerified": true
}
```

**Expected Result:**
- Banner disappears or shows "Phone verified" status
- User record updated: `phoneVerified: true`
- Yellow warning banner should no longer appear

---

### Test 3: Create Passenger

**UI Steps:**
1. On Coordinator Dashboard (`/coordinator/home`)
2. Click `Add Passenger` button (or `+ Add Passenger` button)
3. Fill passenger form:
   - Full Name: `John Doe`
   - Phone: `+2348023456789` (required)
   - Email: `john@example.com` (optional)
   - Notes: `Prefers front seat` (optional)
4. Click `Create Passenger` button

**API Verification:**
```bash
# Check passenger was created
GET /api/coordinator/passengers
# Should return array including the new passenger

# Direct API call (optional):
POST /api/coordinator/passengers
Headers: { "Content-Type": "application/json" }
Body: {
  "fullName": "John Doe",
  "phone": "+2348023456789",
  "email": "john@example.com",
  "notes": "Prefers front seat"
}
```

**Expected Result:**
- Passenger appears in "My Passengers" list
- Success toast: "Passenger created"
- Dialog closes
- Passenger has `createdByUserId` matching coordinator's ID

---

### Test 4: Book Ride for Passenger

**UI Steps:**
1. On Coordinator Dashboard (`/coordinator/home`)
2. Click `Book Ride` button (or `Book Ride for Passenger` button)
3. Fill ride booking form:
   - **Passenger:** Select `John Doe` from dropdown
   - **Pickup Location:** `123 Main Street, Lagos`
   - **Dropoff Location:** `456 Business Park, Victoria Island`
   - **Fare Estimate:** `1500` (optional, can leave empty)
4. Click `Request Ride` button

**API Verification:**
```bash
# Direct API call (optional):
POST /api/coordinator/request-ride
Headers: { "Content-Type": "application/json" }
Body: {
  "passengerId": "<passenger-id-from-step-3>",
  "pickupLocation": "123 Main Street, Lagos",
  "dropoffLocation": "456 Business Park, Victoria Island",
  "fareEstimate": 1500
}
```

**Expected Result:**
- Success toast: "Ride requested. Searching for driver..."
- Dialog closes
- Ride created with:
  - `bookedByUserId` = coordinator's user ID
  - `passengerId` = selected passenger's ID
  - `userId` = passenger's user ID (if passenger is a user) OR the passenger record ID

---

### Test 5: Verify Ride Contains bookedByUserId and passengerId

**API Verification:**
```bash
# Get the ride that was just created
GET /api/rider/active-ride
# OR if ride was assigned/completed:
GET /api/rider/rides/<ride-id>

# Expected Response should include:
{
  "id": "...",
  "pickupLocation": "123 Main Street, Lagos",
  "dropoffLocation": "456 Business Park, Victoria Island",
  "bookedByUserId": "<coordinator-user-id>",
  "passengerId": "<passenger-id>",
  "userId": "...", // passenger's user ID or passenger record
  "status": "REQUESTED" | "ASSIGNED" | ...
}
```

**Database Check (optional):**
```sql
-- If you have DB access, verify directly:
SELECT id, "bookedByUserId", "passengerId", "userId", status 
FROM "Ride" 
WHERE "bookedByUserId" IS NOT NULL 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

---

### Test 6: Driver Assignment (APPROVED + ONLINE only)

**Prerequisites:**
- Have at least one driver with:
  - `DriverProfile.status = "APPROVED"`
  - `Driver.status = "ACTIVE"`
  - `Driver.isOnline = true`
  - Not currently on an `IN_PROGRESS` ride

**API Verification:**
```bash
# Check available drivers (should only return APPROVED + ONLINE)
GET /api/drivers/available

# After booking ride, check if driver was assigned:
GET /api/rider/active-ride
# Should show driver object if assigned

# Or check driver's ride:
GET /api/driver/active-ride
# (if authenticated as driver)
```

**Expected Result:**
- Ride status transitions to `ASSIGNED` only if driver meets all conditions
- Driver object appears in ride response
- If no APPROVED + ONLINE driver available, ride stays `REQUESTED`

---

### Test 7: Verify Notifications Created

**API Verification:**
```bash
# Check coordinator's notifications
GET /api/rider/notifications
# Should see notifications related to ride booking

# Check driver's notifications (if authenticated as driver)
GET /api/driver/notifications
# Should see "RIDE_ASSIGNED" notification

# Check passenger notifications (if passenger is a user account)
GET /api/rider/notifications
# (authenticated as passenger)
```

**Expected Result:**
- Coordinator receives notification about ride request
- Driver receives notification when assigned
- Passenger record should have ride linked (if passenger is a user, they get notifications too)

**Database Check (optional):**
```sql
-- Check notifications table
SELECT "userId", role, message, type, "createdAt"
FROM "Notification"
WHERE type IN ('RIDE_REQUESTED', 'RIDE_ASSIGNED')
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## B) RIDESHARE FLOW

### Test 8: Rider A Requests SHARE Ride (Creates OPEN Group)

**UI Steps:**
1. Log in as Rider A (or register new rider): `http://localhost:5173/rider/register`
   - User Type: `Rider` (default)
   - Email: `ridera@test.com`
2. Navigate to: `http://localhost:5173/rider/request`
3. Enter locations:
   - Pickup: `100 Ikeja Road, Lagos`
   - Destination: `200 Victoria Island, Lagos`
4. Click `Continue` (or `Calculate Route`)
5. On confirm page (`/rider/confirm`):
   - **Select `Share` ride mode** (toggle between Private/Share)
   - Fare should show: `Your Share: ₦675` (if total is ₦1500, split is ₦750 with 10% discount)
   - Text: "Total fare: ₦1500 • You save ₦75"
6. Click `Confirm Ride` button

**API Verification:**
```bash
# Check response from request-ride
POST /api/rider/request-ride
Headers: { "Content-Type": "application/json" }
Body: {
  "pickupLocation": "100 Ikeja Road, Lagos",
  "dropoffLocation": "200 Victoria Island, Lagos",
  "fareEstimate": 1500,
  "rideMode": "SHARE",
  "pickupLat": 6.5244,
  "pickupLng": 3.3792,
  "destLat": 6.4281,
  "destLng": 3.4219
}

# Expected Response:
{
  "id": "...",
  "rideMode": "SHARE",
  "shareGroupId": "<group-id>",
  "maxPassengers": 2,
  "shareStatus": "SEARCHING", // ← Key indicator
  "status": "REQUESTED"
}
```

**Expected Result:**
- Ride created with `rideMode: "SHARE"`
- `ShareGroup` created with `status: "OPEN"`
- `ShareParticipant` created for Rider A
- `shareStatus: "SEARCHING"` in response
- Notification: "Finding a co-rider..."
- **NO driver assigned yet** (waiting for second rider)

---

### Test 9: Rider B Requests SHARE Ride (Fills Group)

**UI Steps:**
1. **In different browser/incognito window** (to maintain separate session)
2. Log in as Rider B: `riderb@test.com`
3. Navigate to: `http://localhost:5173/rider/request`
4. Enter **compatible** locations (within 1.5km pickup, 5km destination):
   - Pickup: `150 Ikeja Road, Lagos` (close to Rider A's pickup)
   - Destination: `250 Victoria Island, Lagos` (close to Rider A's destination)
5. Click `Continue`
6. On confirm page:
   - **Select `Share` ride mode**
   - Click `Confirm Ride`

**API Verification:**
```bash
POST /api/rider/request-ride
Body: {
  "pickupLocation": "150 Ikeja Road, Lagos",
  "dropoffLocation": "250 Victoria Island, Lagos",
  "fareEstimate": 1500,
  "rideMode": "SHARE",
  "pickupLat": 6.5245, // Within 1.5km of Rider A
  "pickupLng": 3.3793,
  "destLat": 6.4282, // Within 5km of Rider A
  "destLng": 3.4220
}

# Expected Response:
{
  "id": "...",
  "shareStatus": "MATCHED" | "MATCHED_AND_ASSIGNED",
  "shareGroup": {
    "id": "<same-group-id-as-rider-a>",
    "status": "FULL",
    "participants": [
      { "userId": "<rider-a-id>", ... },
      { "userId": "<rider-b-id>", ... }
    ]
  },
  "driver": { ... } // If driver assigned
}
```

**Expected Result:**
- Rider B matched into Rider A's `ShareGroup`
- `ShareGroup.status` updated to `FULL`
- **Ride activated and driver matching triggered** (only when FULL)
- Both riders notified: "Matched! Driver is being assigned..."
- Ride status: `REQUESTED` or `ASSIGNED` (if driver available)
- **Single ride created** (not two separate rides) representing the shared trip

---

### Test 10: Fare Split Stored Per Participant

**API Verification:**
```bash
# Check share group participants
GET /api/rider/share-group/<share-group-id>/status

# Or check ride with shareGroup included
GET /api/rider/active-ride
# Should include shareGroup with participants

# Expected Response:
{
  "shareGroup": {
    "participants": [
      {
        "id": "...",
        "userId": "<rider-a-id>",
        "fareShareAmount": 675, // (1500/2) * 0.9 = 675
        "pickupLocation": "...",
        "dropoffLocation": "..."
      },
      {
        "id": "...",
        "userId": "<rider-b-id>",
        "fareShareAmount": 675,
        "pickupLocation": "...",
        "dropoffLocation": "..."
      }
    ]
  }
}
```

**Expected Result:**
- Each participant has `fareShareAmount` stored
- Amount = `(totalFare / participantsCount) * 0.9` (50/50 split with 10% discount)
- Both riders see their share in the UI

---

### Test 11: Escrow Holds Each Share at IN_PROGRESS

**Prerequisites:**
- Ride must transition to `IN_PROGRESS` status
- Both riders need wallet balance >= their fare share

**API Verification:**
```bash
# Transition ride to IN_PROGRESS (as driver or via test endpoint)
POST /api/rides/<ride-id>/start

# Check wallets after IN_PROGRESS
GET /api/rider/wallet
# (authenticated as Rider A, then Rider B)

# Expected: Each rider's wallet should be debited by their fareShareAmount
# Balance should decrease by ~675 (each rider's share)
```

**Database Check (optional):**
```sql
-- Check transactions for both riders
SELECT "walletId", type, amount, reference, "createdAt"
FROM "Transaction"
WHERE reference LIKE '%Shared ride%' OR reference LIKE '%ride payment%'
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check wallet balances
SELECT "ownerId", "ownerType", balance
FROM "Wallet"
WHERE "ownerType" = 'USER'
AND "ownerId" IN ('<rider-a-id>', '<rider-b-id>');
```

**Expected Result:**
- When ride transitions to `IN_PROGRESS`, wallet escrow holds each rider's `fareShareAmount`
- Two separate debit transactions (one per participant)
- Wallet balance decreases for both riders

---

### Test 12: Cancellation Behavior (Before IN_PROGRESS)

**UI Steps (Rider A cancels while OPEN):**
1. Rider A has SHARE ride with status `SEARCHING` (only 1 participant)
2. Navigate to active ride page or cancel via API
3. Cancel the ride

**API Verification:**
```bash
# Cancel ride while group is OPEN
POST /api/rider/rides/<ride-id>/cancel
Headers: { "Content-Type": "application/json" }
Body: {}

# Expected Response:
{
  "status": "CANCELLED",
  "shareStatus": "GROUP_CANCELLED"
}
```

**Expected Result:**
- `ShareGroup.status` = `CANCELLED`
- Ride status = `CANCELLED`
- **No penalty applied** (100% refund if any escrow was held)
- Notification: "Shared ride cancelled. No penalty applied."

---

### Test 13: Cancellation Behavior (After IN_PROGRESS)

**Prerequisites:**
- Ride with 2 participants (FULL group)
- Ride status = `IN_PROGRESS`

**UI Steps:**
1. As Rider A, cancel the ride after it's IN_PROGRESS

**API Verification:**
```bash
# Cancel ride after IN_PROGRESS
POST /api/rider/rides/<ride-id>/cancel

# Expected Response:
{
  "status": "CANCELLED",
  "shareStatus": "CANCELLED_WITH_PENALTY",
  "penaltyAmount": 135, // 20% of 675 (rider's share)
  "refundAmount": 540 // 80% of 675
}

# Check wallet transactions
GET /api/rider/wallet/transactions

# Should see:
# - CREDIT transaction: 540 (refund)
# - COMMISSION transaction: 135 (penalty retained by platform)
```

**Expected Result:**
- **20% penalty applied** to cancelling rider's `fareShareAmount` only
- **80% refunded** to cancelling rider's wallet
- **Other rider (Rider B) is NOT affected** - their share remains held
- Notification: "Shared ride cancelled. Cancellation fee (20%): ₦135. Refunded (80%): ₦540"

**Database Check (optional):**
```sql
-- Verify penalty calculation
SELECT 
  "fareShareAmount",
  0.20 * "fareShareAmount" as penalty_calc,
  0.80 * "fareShareAmount" as refund_calc
FROM "ShareParticipant"
WHERE "userId" = '<rider-a-id>';
```

---

### Test 14: Timeout Conversion (Optional - Advanced)

**Simulation:**
- Create SHARE ride (Rider A only)
- Wait 5+ minutes OR manually trigger timeout check

**API Verification:**
```bash
# Check share group status (triggers timeout check if > 5 minutes old)
GET /api/rider/share-group/<share-group-id>/status

# If timeout occurred, expected response:
{
  "status": "CLOSED",
  "rides": [
    {
      "rideMode": "PRIVATE", // ← Converted from SHARE
      "maxPassengers": 1,
      "fareEstimate": 1500 // Full fare (no discount)
    }
  ]
}
```

**Expected Result:**
- After 5 minutes with only 1 participant:
  - `ShareGroup.status` = `CLOSED`
  - Ride `rideMode` = `PRIVATE`
  - Ride `maxPassengers` = 1
  - `fareShareAmount` updated to full fare (no discount)
  - Driver matching triggered for PRIVATE ride
  - Notification: "Converted to private ride due to timeout..."

---

## Additional Verification Points

### Route Compatibility Check
- **Match should occur if:**
  - Pickup distance ≤ 1.5 km
  - Destination distance ≤ 5 km (or ≤ 10 km as fallback)
- **Match should NOT occur if:**
  - Pickup distance > 1.5 km
  - Destination distance > 10 km
  - Same user trying to match with themselves

### Driver View (Shared Ride)
- Driver should see ride with:
  - `maxPassengers: 2`
  - `shareGroup` with 2 participants
  - Ordered stops: pickup1 → pickup2 → drop1 → drop2

---

## Notes
- All API calls require session authentication (cookies)
- Use browser DevTools Network tab to inspect actual API requests/responses
- Database direct access (SQLite: `prisma/dev.db`) optional but helpful for deep verification
- Test accounts should have sufficient wallet balance for fare escrow

---

**Test Date:** _______________  
**Tester:** _______________  
**Environment:** Local Dev (`npm run dev`)  
**Database:** SQLite (`prisma/dev.db`)
