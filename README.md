# HerVoice
2026 Paris Hack the Block Hackathon Project

# Clinic Funding Redemption Backend

This is the backend for our XRPL hackathon MVP.

It is a simple demo API that simulates a clinic-side funding redemption flow for abortion access:

1. A funder creates a funding case
2. The backend locks funds in an XRPL escrow
3. The system generates a voucher
4. A clinic verifies the voucher
5. The clinic confirms service delivery
6. The escrow is released to the clinic wallet on XRPL Testnet

## What this project is trying to show

This project does **not** put patient identity or medical records on-chain.

Instead, it shows how XRPL can be used to turn a funding promise into a real clinic payout flow:

- funds are locked first
- a voucher is created
- the clinic checks the voucher
- after service confirmation, the payment is released on-chain

This is a demo prototype for hackathon purposes.

---

## Tech stack

- Python 3.11+ recommended
- FastAPI
- SQLite
- SQLAlchemy
- xrpl-py
- XRPL Testnet

---

## Project structure

```text
backend/
├── .env
├── .env.example
├── requirements.txt
├── main.py
├── config.py
├── database.py
├── models.py
├── schemas.py
├── services/
│   ├── xrpl_service.py
│   └── voucher_service.py
└── routers/
    ├── fund.py
    ├── voucher.py
    ├── clinic.py
    └── dashboard.py