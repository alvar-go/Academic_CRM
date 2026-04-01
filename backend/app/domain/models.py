from pydantic import BaseModel, EmailStr, Field


class Applicant(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    program: str
    status: str
    stage: str
    score: float
    created_at: str


class ApplicantCreate(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    program: str = Field(min_length=2, max_length=120)
    status: str = Field(default="In Review", min_length=2, max_length=60)
    stage: str = Field(default="Document Review", min_length=2, max_length=60)
    score: float = Field(default=0, ge=0, le=100)


class AdvisingTask(BaseModel):
    id: int
    student_name: str
    program: str
    owner: str
    due_date: str
    priority: str
    status: str


class DashboardStat(BaseModel):
    label: str
    value: int
    accent: str


class DashboardResponse(BaseModel):
    stats: list[DashboardStat]
    applicants: list[Applicant]
    tasks: list[AdvisingTask]
