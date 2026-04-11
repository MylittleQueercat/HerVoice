from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, Tuple
from models import FundingCase, Voucher, CaseStatus, VoucherStatus
from services.xrpl_service import generate_condition, create_escrow, finish_escrow, get_funder_wallet
from config import CLINIC_WALLET_ADDRESS


def create_funding_case(amount_xrp: int, db: Session) -> tuple[FundingCase, Voucher]:
    """
    1. Generate condition/fulfillment pair.
    2. Create FundingCase and Voucher rows with status PENDING.
    3. Call EscrowCreate on XRPL.
    4. Update FundingCase with escrow details and set status to ACTIVE.
    5. Return (case, voucher).
    """
    funder = get_funder_wallet()
    amount_drops = amount_xrp * 1_000_000

    condition_pair = generate_condition()

    case = FundingCase(
        funder_address=funder.address,
        clinic_address=CLINIC_WALLET_ADDRESS,
        amount_xrp=amount_xrp,
        amount_drops=amount_drops,
        fulfillment_hex=condition_pair["fulfillment_hex"],
        condition_hex=condition_pair["condition_hex"],
        status=CaseStatus.PENDING,
    )
    db.add(case)
    db.flush()

    voucher = Voucher(
        funding_case_id=case.id,
        status=VoucherStatus.UNUSED,
    )
    db.add(voucher)
    db.flush()

    result = create_escrow(amount_drops, condition_pair["condition_hex"])

    case.tx_hash_create = result["tx_hash"]
    case.escrow_sequence = result["sequence"]
    case.status = CaseStatus.ACTIVE

    db.commit()
    db.refresh(case)
    db.refresh(voucher)
    return case, voucher


def get_voucher_with_case(voucher_id: str, db: Session) -> Optional[Tuple[Voucher, FundingCase]]:
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()
    if not voucher:
        return None
    case = db.query(FundingCase).filter(FundingCase.id == voucher.funding_case_id).first()
    return voucher, case


def verify_voucher(voucher_id: str, db: Session) -> dict:
    result = get_voucher_with_case(voucher_id, db)
    if not result:
        return {"valid": False, "status": None, "amount_xrp": None, "message": "Voucher not found"}

    voucher, case = result

    if voucher.status == VoucherStatus.REDEEMED:
        return {"valid": False, "status": voucher.status, "amount_xrp": case.amount_xrp, "message": "Voucher already redeemed"}

    if voucher.status == VoucherStatus.EXPIRED:
        return {"valid": False, "status": voucher.status, "amount_xrp": case.amount_xrp, "message": "Voucher expired"}

    if case.status != CaseStatus.ACTIVE:
        return {"valid": False, "status": voucher.status, "amount_xrp": case.amount_xrp, "message": f"Case not active (status: {case.status})"}

    return {"valid": True, "status": voucher.status, "amount_xrp": case.amount_xrp, "message": "Voucher valid"}


def confirm_service_and_release(voucher_id: str, db: Session) -> dict:
    result = get_voucher_with_case(voucher_id, db)
    if not result:
        raise ValueError("Voucher not found")

    voucher, case = result
    verify = verify_voucher(voucher_id, db)
    if not verify["valid"]:
        raise ValueError(verify["message"])

    voucher.status = VoucherStatus.REDEEMED
    voucher.redeemed_at = datetime.now(timezone.utc)
    db.commit()

    try:
        xrpl_result = finish_escrow(
            funder_address=case.funder_address,
            escrow_sequence=case.escrow_sequence,
            fulfillment_hex=case.fulfillment_hex,
            condition_hex=case.condition_hex,
        )
    except Exception as e:
        voucher.status = VoucherStatus.UNUSED
        voucher.redeemed_at = None
        db.commit()
        raise Exception(f"EscrowFinish failed: {e}")

    case.tx_hash_finish = xrpl_result["tx_hash"]
    case.status = CaseStatus.RELEASED
    case.released_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "tx_hash": xrpl_result["tx_hash"],
        "amount_xrp": case.amount_xrp,
        "clinic_address": case.clinic_address,
    }