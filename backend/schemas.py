from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

class ApplicationInput(BaseModel):
    revolving_utilization_unsecured_lines: float
    age: int = Field(gt=17, lt=100)
    number_of_time_30_59_days_past_due_not_worse: int
    debt_ratio: float
    monthly_income: Optional[float] = None 
    number_of_open_credit_lines_and_loans: int
    number_of_times_90_days_late: int
    number_real_estate_loans_or_lines: int
    number_of_time_60_89_days_past_due_not_worse: int
    number_of_dependents: Optional[int] = None 

class FeatureContribution(BaseModel):
    feature: str
    value: float
    shap_contribution: float
    impact: str

class PredictionOutput(BaseModel):
    prediction_id: UUID
    application_id: UUID
    risk_probability: float
    top_features: list[FeatureContribution]
    model_version: str
    predicted_at: datetime

class ReviewInput(BaseModel):
    prediction_id: UUID
    decision: Literal["approve", "reject"]
    reviewer_id: str
    override_reason: Optional[str] = None

class ReviewOutput(BaseModel):
    review_id: UUID
    prediction_id: UUID
    decision: Literal["approve", "reject"]
    reviewer_id: str
    override_reason: Optional[str] = None
    reviewed_at: datetime

class PredictionHistoryOutput(BaseModel):
    prediction_id: UUID
    application_id: UUID
    risk_probability: float
    model_version: str
    predicted_at: datetime

    review_id: Optional[UUID] = None
    decision: Optional[Literal["approve", "reject"]] = None
    reviewer_id: Optional[str] = None
    override_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None

class PredictionHistoryResponse(BaseModel):
    items: list[PredictionHistoryOutput]
    page: int
    page_size: int
    total: int
    total_pages: int

class PredictionDetailOutput(BaseModel):
    prediction_id: UUID
    application_id: UUID
    risk_probability: float
    top_features: list[FeatureContribution]
    model_version: str
    predicted_at: datetime
    reviews: list[ReviewOutput]
