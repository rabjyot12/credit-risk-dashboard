CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL DEFAULT 1,
    previous_application_id UUID REFERENCES applications(application_id),

	revolving_utilization_unsecured_lines REAL,
	age INTEGER,
	number_of_time_30_59_days_past_due_not_worse INTEGER,
	debt_ratio REAL,
	monthly_income REAL,
	number_of_open_credit_lines_and_loans INTEGER,
	number_of_times_90_days_late INTEGER,
	number_real_estate_loans_or_lines INTEGER,
	number_of_time_60_89_days_past_due_not_worse INTEGER,
	number_of_dependents INTEGER,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
)