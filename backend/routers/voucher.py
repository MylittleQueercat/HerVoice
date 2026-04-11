from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import VoucherStatusResponse
from services.voucher_service import get_voucher_with_case

router = APIRouter(prefix="/api/voucher", tags=["voucher"])


@router.get("/{voucher_id}", response_model=VoucherStatusResponse)
def get_voucher_status(voucher_id: str, db: Session = Depends(get_db)):
    result = get_voucher_with_case(voucher_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Voucher not found")

    voucher, case = result
    return VoucherStatusResponse(
        voucher_id=voucher.id,
        status=voucher.status,
        funding_case_id=case.id,
        amount_xrp=case.amount_xrp,
        case_status=case.status,
        created_at=voucher.created_at,
        redeemed_at=voucher.redeemed_at,
    )