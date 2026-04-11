import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from schemas import SubmitProofResponse
from services.appointment_service import submit_completion_proof

UPLOAD_DIR = "uploads"
MAX_PDF_SIZE = 5 * 1024 * 1024  # 5 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/proof", tags=["proof"])


@router.post("", response_model=SubmitProofResponse)
def submit_proof(
    appointment_id: str = Form(...),
    rpps_invoice_number: str = Form(...),
    total_cost_eur: int = Form(..., description="Total cost in EUR cents. Example: 45000 = 450.00 EUR"),
    pdf: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Submit completion proof for an appointment.

    This endpoint uses multipart/form-data (not JSON) because it accepts an optional PDF file.

    pdf: optional. If provided, it must be a PDF and smaller than 5 MB.
    """
    pdf_filename = None

    if pdf:
        original_name = pdf.filename or ""

        if not original_name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_PROOF_FILE",
                    "detail": "Only PDF files are allowed.",
                },
            )

        if pdf.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_PROOF_FILE",
                    "detail": "Uploaded file must have content type application/pdf.",
                },
            )

        file_bytes = pdf.file.read()
        file_size = len(file_bytes)

        if file_size > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "PROOF_FILE_TOO_LARGE",
                    "detail": "PDF file must be smaller than 5 MB.",
                },
            )

        safe_original_name = os.path.basename(original_name)
        safe_filename = f"{appointment_id}_{safe_original_name}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        pdf_filename = safe_filename

    try:
        proof = submit_completion_proof(
            appointment_id=appointment_id,
            rpps_invoice_number=rpps_invoice_number,
            total_cost_eur=total_cost_eur,
            pdf_filename=pdf_filename,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "SUBMIT_PROOF_FAILED",
                "detail": str(e),
            },
        )

    message = "Proof submitted."
    if proof.escrow_tx_hash:
        message = "Proof submitted. Payment released on XRPL."

    return SubmitProofResponse(
        proof_id=proof.id,
        appointment_id=proof.appointment_id,
        escrow_tx_hash=proof.escrow_tx_hash,
        message=message,
    )