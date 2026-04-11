# HerVoice
2026 Paris Hack the Block Hackathon Project

# HerVoice Backend

This is the backend for our XRPL hackathon MVP.

It supports a **cross-border abortion access workflow** for people in Europe who cannot legally or practically obtain abortion care in their home country.

The backend currently supports:

- clinic registration
- clinic slot management
- patient case creation
- clinic browsing
- appointment booking
- proof submission after care
- escrow-based payout flow on XRPL Testnet
- monitoring through a dashboard

---

## What this project is trying to show

This project does **not** put patient identity or medical records on-chain.

Instead, it shows how a platform can coordinate:

1. a patient case
2. a clinic appointment
3. proof of completed care
4. a payout / settlement flow

The XRPL part is used for the **settlement layer**, not for storing sensitive health information.

In simple terms:

- a funding case is created
- funds are locked in escrow
- the clinic completes care
- the clinic submits proof
- the payout is released on XRPL Testnet

This is a demo prototype for hackathon purposes.

---

## Current product scope

The backend currently supports three main roles:

### 1. Patient
A patient can:

- create a case
- receive an access code
- browse clinics by city
- see available appointment slots
- book an appointment
- reschedule or cancel using the access code
- check case status

### 2. Clinic
A clinic can:

- register itself
- add appointment slots
- view appointments
- submit proof of completed care
- trigger the payout workflow

### 3. Funder / Monitor
A funder or monitor can:

- create funding cases
- link funding to an appointment
- track payout status through the dashboard

---

## Tech stack

- Python 3.9
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
├── validate_condition.py
├── uploads/
├── services/
│   ├── __init__.py
│   ├── xrpl_service.py
│   ├── voucher_service.py
│   └── appointment_service.py
└── routers/
    ├── __init__.py
    ├── fund.py
    ├── voucher.py
    ├── clinic.py
    ├── dashboard.py
    ├── clinics.py
    ├── clinic_admin.py
    ├── cases.py
    ├── appointments.py
    └── proof.py