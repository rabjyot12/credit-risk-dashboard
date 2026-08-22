-- This table stores the applications submitted by users. Each application can have multiple versions, 
--and the previous version is referenced by the `previous_application_id` column. 
--The `version` column is used to track the version of the application.
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
);

-- This table stores the predictions made by the machine learning model for each application.
CREATE TABLE predictions (
	prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	application_id UUID NOT NULL REFERENCES applications(application_id),
	risk_probability REAL NOT NULL CHECK(risk_probability >= 0 AND risk_probability <= 1),
	shap_values JSONB NOT NULL,
	model_version TEXT NOT NULL,
	predicted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- This table stores the reviews made by human reviewers for each prediction.
CREATE TABLE reviews (
	review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	prediction_id UUID NOT NULL REFERENCES predictions(prediction_id),
	decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject')),
	reviewer_id TEXT NOT NULL,
	override_reason TEXT,
	reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
