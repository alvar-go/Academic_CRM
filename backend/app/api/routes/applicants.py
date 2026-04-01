from fastapi import APIRouter, status

from backend.app.core.database import create_applicant, list_applicants
from backend.app.domain.models import Applicant, ApplicantCreate

router = APIRouter()


@router.get("", response_model=list[Applicant])
def get_applicants() -> list[Applicant]:
    return list_applicants()


@router.post("", response_model=Applicant, status_code=status.HTTP_201_CREATED)
def add_applicant(payload: ApplicantCreate) -> Applicant:
    return create_applicant(payload)
