from fastapi import APIRouter

from backend.app.core.database import list_applicants, list_tasks
from backend.app.domain.models import DashboardResponse, DashboardStat

router = APIRouter()


@router.get("", response_model=DashboardResponse)
def get_dashboard() -> DashboardResponse:
    applicants = list_applicants()
    tasks = list_tasks()

    stats = [
        DashboardStat(
            label="Applicants",
            value=len(applicants),
            accent="var(--accent-gold)",
        ),
        DashboardStat(
            label="Interviews Pending",
            value=sum(1 for applicant in applicants if applicant.stage == "Interview"),
            accent="var(--accent-cyan)",
        ),
        DashboardStat(
            label="Offers Ready",
            value=sum(1 for applicant in applicants if applicant.status == "Offer Ready"),
            accent="var(--accent-salmon)",
        ),
        DashboardStat(
            label="Open Advising Tasks",
            value=sum(1 for task in tasks if task.status != "Done"),
            accent="var(--accent-ink)",
        ),
    ]

    return DashboardResponse(stats=stats, applicants=applicants, tasks=tasks)
