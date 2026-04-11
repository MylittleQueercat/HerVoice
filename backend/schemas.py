from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models import CaseStatus, VoucherStatus


# --- Request bodies ---

class CreateFundRequest(BaseModel):
    amount_xrp: int = Field(..., ge=1, le=1000, description="Amount in XRP, minimum 1, maximum 1000")


class VerifyVoucherRequest(BaseModel):
    voucher_id: str


class ConfirmServiceRequest(BaseModel):
    voucher_id: str


# --- Response bodies ---

class CreateFundResponse(BaseModel):
    case_id: str
    voucher_id: str
    amount_xrp: int
    escrow_tx_hash: str
    status: CaseStatus
    message: str


class VoucherStatusResponse(BaseModel):
    voucher_id: str
    status: VoucherStatus
    funding_case_id: str
    amount_xrp: int
    case_status: CaseStatus
    created_at: datetime
    redeemed_at: Optional[datetime]


class VerifyVoucherResponse(BaseModel):
    voucher_id: str
    valid: bool
    status: Optional[VoucherStatus]
    amount_xrp: Optional[int]
    message: str


class ConfirmServiceResponse(BaseModel):
    voucher_id: str
    case_id: str
    tx_hash: str
    amount_xrp: int
    clinic_address: str
    message: str


class DashboardCase(BaseModel):
    case_id: str
    voucher_id: Optional[str]
    amount_xrp: int
    case_status: CaseStatus
    voucher_status: Optional[VoucherStatus]
    tx_hash_create: Optional[str]
    tx_hash_finish: Optional[str]
    created_at: datetime
    released_at: Optional[datetime]


class DashboardResponse(BaseModel):
    total_cases: int
    total_xrp_locked: int
    total_xrp_released: int
    cases: list[DashboardCase]