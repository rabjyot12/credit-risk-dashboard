CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL DEFAULT 1,
    previous_application_id UUID REFERENCES applications(application_id),

    RevolvingUtilizationOfUnsecuredLines REAL,
    age INTEGER,
    NumberOfTime30-59DaysPastDueNotWorse INTEGER,
    DebtRatio REAL,
    MonthlyIncome REAL,
    NumberOfOpenCreditLinesAndLoans INTEGER,
    NumberOfTimes90DaysLate INTEGER,
    NumberRealEstateLoansOrLines INTEGER,
    NumberOfTime60-89DaysPastDueNotWorse INTEGER,
    NumberOfDependents REAL,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
)