# Backend Part

## What is already finished

The backend MVP is already working end to end.

Working flow:

1. Create funding case
2. Lock funds in XRPL escrow
3. Generate voucher
4. Verify voucher
5. Confirm service
6. Release escrow to clinic
7. Display updated case on dashboard

This is already running successfully on XRPL Testnet.

---

## What frontend needs to do

Frontend only needs to connect to the API.

Think of the backend like this:

- `/api/fund` = create a new funding case
- `/api/voucher/{id}` = check voucher details
- `/api/clinic/verify` = verify voucher
- `/api/clinic/confirm` = release payment
- `/api/dashboard` = show summary

---

## Suggested frontend screens

### 1. Funder screen
Input:
- amount in XRP

Action:
- call `POST /api/fund`

Display:
- case id
- voucher id
- escrow tx hash

---

### 2. Clinic screen
Input:
- voucher id

Actions:
- call `POST /api/clinic/verify`
- then call `POST /api/clinic/confirm`

Display:
- valid / invalid
- voucher status
- amount
- payment tx hash

---

### 3. Dashboard screen
Call:
- `GET /api/dashboard`

Display:
- total cases
- total XRP locked
- total XRP released
- case list

---

## Important UX note

These two endpoints are slow because they wait for XRPL confirmation:

- `POST /api/fund`
- `POST /api/clinic/confirm`

Please show a loading state.

---

## Example API flow

### Create funding case

```bash
curl -X POST http://localhost:8000/api/fund \
  -H "Content-Type: application/json" \
  -d '{"amount_xrp": 5}'