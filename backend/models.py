from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from database import Base


class CaseStatus(str, enum.Enum):
    PENDING = "pending"       # escrow tx submitted but not yet confirmed on-chain
    ACTIVE = "active"         # escrow confirmed, voucher ready to use
    RELEASED = "released"     # escrow finished, payment sent to clinic
    FAILED = "failed"         # escrow create tx failed


class VoucherStatus(str, enum.Enum):
    UNUSED = "unused"
    REDEEMED = "redeemed"
    EXPIRED = "expired"


class FundingCase(Base):
    __tablename__ = "funding_cases"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    funder_address = Column(String, nullable=False)
    clinic_address = Column(String, nullable=False)
    amount_xrp = Column(Integer, nullable=False)       # in XRP (whole number), NOT drops
    amount_drops = Column(Integer, nullable=False)     # amount_xrp * 1_000_000
    escrow_sequence = Column(Integer, nullable=True)   # sequence number of EscrowCreate tx
    fulfillment_hex = Column(String, nullable=True)    # secret — used by EscrowFinish, never exposed in API
    condition_hex = Column(String, nullable=True)      # public — written into EscrowCreate
    status = Column(SAEnum(CaseStatus), nullable=False, default=CaseStatus.PENDING)
    tx_hash_create = Column(String, nullable=True)     # hash of EscrowCreate tx
    tx_hash_finish = Column(String, nullable=True)     # hash of EscrowFinish tx
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    released_at = Column(DateTime, nullable=True)

    voucher = relationship("Voucher", back_populates="funding_case", uselist=False)


class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    funding_case_id = Column(String, ForeignKey("funding_cases.id"), nullable=False, unique=True)
    status = Column(SAEnum(VoucherStatus), nullable=False, default=VoucherStatus.UNUSED)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    redeemed_at = Column(DateTime, nullable=True)

    funding_case = relationship("FundingCase", back_populates="voucher")