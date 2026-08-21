from backend.models.ml_model import predict_and_explain

# Test with a sample application
test_input = {
    "revolving_utilization_unsecured_lines": 0.019,
    "age": 66,
    "number_of_time_30_59_days_past_due_not_worse": 0,
    "debt_ratio": 0.43,
    "monthly_income": 5175,
    "number_of_open_credit_lines_and_loans": 13,
    "number_of_times_90_days_late": 0,
    "number_real_estate_loans_or_lines": 1,
    "number_of_time_60_89_days_past_due_not_worse": 0,
    "number_of_dependents": 0,
}

result = predict_and_explain(test_input)
print("Test 1 - Normal input:")
print(result)

# Test 2: missing optional values
test_input_missing = {
    "revolving_utilization_unsecured_lines": 0.12,
    "age": 61,
    "number_of_time_30_59_days_past_due_not_worse": 0,
    "debt_ratio": 0.35,
    "monthly_income": None,
    "number_of_open_credit_lines_and_loans": 13,
    "number_of_times_90_days_late": 0,
    "number_real_estate_loans_or_lines": 1,
    "number_of_time_60_89_days_past_due_not_worse": 0,
    "number_of_dependents": None,
}

result_missing = predict_and_explain(test_input_missing)
print("\nTest 2 - Missing optional values:")
print(result_missing)