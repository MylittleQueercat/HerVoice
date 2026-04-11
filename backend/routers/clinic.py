from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import VerifyVoucherRequest, VerifyVoucherResponse, ConfirmServiceRequest, ConfirmServiceResponse
from services.voucher_service import verify_voucher, confirm_service_and_release, get_voucher_with_case

router = APIRouter(prefix="/api/clinic", tags=["clinic"])


@router.post("/verify", response_model=VerifyVoucherResponse)
def verify(request: VerifyVoucherRequest, db: Session = Depends(get_db)):
    """Check if voucher is valid. Does not modify any state. Call before confirm."""
    result = verify_voucher(request.voucher_id, db)
    return VerifyVoucherResponse(
        voucher_id=request.voucher_id,
        valid=result["valid"],
        status=result["status"],
        amount_xrp=result["amount_xrp"],
        message=result["message"],
    )


@router.post("/confirm", response_model=ConfirmServiceResponse)
def confirm(request: ConfirmServiceRequest, db: Session = Depends(get_db)):
    """
    Confirm service delivered and release escrow.
    Expected response time: 5-15 seconds. Frontend must show loading state.
    """
    try:
        result = confirm_service_and_release(request.voucher_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    case_result = get_voucher_with_case(request.voucher_id, db)
    case = case_result[1]

    return ConfirmServiceResponse(
        voucher_id=request.voucher_id,
        case_id=case.id,
        tx_hash=result["tx_hash"],
        amount_xrp=result["amount_xrp"],
        clinic_address=result["clinic_address"],
        message="Payment released to clinic.",
    )