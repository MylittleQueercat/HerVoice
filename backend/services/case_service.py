from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models import FundingCase, CaseStatus
from services.xrpl_service import (
    compute_patient_hash,
    generate_condition,
    create_escrow,
    finish_escrow,
    get_funder_wallet,
)
from config import CLINIC_WALLET_ADDRESS


def create_patient_case(
    name: str,
    date_of_birth: str,
    insurance_number: str,
    amount_xrp: int,
    db: Session,
) -> FundingCase:
    """
    Patient creates a funding case.

    1. Compute patient_hash from identity fields (fields are NOT stored).
    2. Reject if patient_hash already has an ACTIVE case.
       RELEASED cases are NOT blocked.
    3. Create FundingCase with status PENDING, no escrow yet.
    """
    patient_hash = compute_patient_hash(name, date_of_birth, insurance_number)

    existing = db.query(FundingCase).filter(
        FundingCase.patient_hash == patient_hash,
        FundingCase.status == CaseStatus.ACTIVE,
    ).first()
    if existing:
        raise ValueError(
            "An active funding case already exists for this patient. "
            "You cannot have two active cases at the same time."
        )

    amount_drops = amount_xrp * 1_000_000

    case = FundingCase(
        patient_hash=patient_hash,
        clinic_address=CLINIC_WALLET_ADDRESS,
        amount_xrp=amount_xrp,
        amount_drops=amount_drops,
        status=CaseStatus.PENDING,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def create_escrow_for_case(case_id: str, db: Session) -> FundingCase:
    """
    Funder creates escrow for an existing PENDING case.
    """
    case = db.query(FundingCase).filter(FundingCase.id == case_id).first()
    if not case:
        raise ValueError("Case not found")

    if case.status != CaseStatus.PENDING:
        raise ValueError(f"Case is not pending (status: {case.status})")

    funder = get_funder_wallet()
    condition_pair = generate_condition()

    result = create_escrow(
        amount_drops=case.amount_drops,
        condition_hex=condition_pair["condition_hex"],
        patient_hash=case.patient_hash,
    )

    case.funder_address = funder.address
    case.fulfillment_hex = condition_pair["fulfillment_hex"]
    case.condition_hex = condition_pair["condition_hex"]
    case.tx_hash_create = result["tx_hash"]
    case.escrow_sequence = result["sequence"]
    case.status = CaseStatus.ACTIVE

    db.commit()
    db.refresh(case)
    return case


def verify_and_release(
    name: str,
    date_of_birth: str,
    insurance_number: str,
    db: Session,
) -> dict:
    """
    Patient arrives at clinic and enters their identity.

    1. Compute patient_hash from input fields (fields are NOT stored).
    2. Look up ACTIVE FundingCase with matching patient_hash.
    3. If no match: return matched=False.
    4. If match: trigger EscrowFinish, update case to RELEASED.
    """
    patient_hash = compute_patient_hash(name, date_of_birth, insurance_number)

    case = db.query(FundingCase).filter(
        FundingCase.patient_hash == patient_hash,
        FundingCase.status == CaseStatus.ACTIVE,
    ).first()

    if not case:
        return {
            "matched": False,
            "case_id": None,
            "tx_hash": None,
            "amount_xrp": None,
            "message": "No active funding found for this identity.",
        }

    try:
        result = finish_escrow(
            funder_address=case.funder_address,
            escrow_sequence=case.escrow_sequence,
            fulfillment_hex=case.fulfillment_hex,
            condition_hex=case.condition_hex,
        )
    except Exception as e:
        raise Exception(f"Identity matched but payment release failed: {e}")

    case.tx_hash_finish = result["tx_hash"]
    case.status = CaseStatus.RELEASED
    case.released_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)

    return {
        "matched": True,
        "case_id": case.id,
        "tx_hash": result["tx_hash"],
        "amount_xrp": case.amount_xrp,
        "message": "Identity verified. Payment released to clinic.",
    }