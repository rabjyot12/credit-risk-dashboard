import joblib
import pandas as pd
import shap
import os
import numpy as np

# Resolve paths correctly (this file is at backend/models/ml_model.py)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "model", "artifacts")

MODEL_PATH = os.path.join(ARTIFACTS_DIR, "model.pkl")
IMPUTATION_PATH = os.path.join(ARTIFACTS_DIR, "imputation_values.pkl")
FEATURE_ORDER_PATH = os.path.join(ARTIFACTS_DIR, "feature_columns.pkl")

#load artifacts once at module import time to avoid reloading them multiple times
model = joblib.load(MODEL_PATH)
imputation_values = joblib.load(IMPUTATION_PATH)
feature_order = joblib.load(FEATURE_ORDER_PATH)
explainer = shap.TreeExplainer(model)

# Map Pydantic snake_case to training feature name
FEATURE_NAME_MAPPING = {
    "revolving_utilization_unsecured_lines": "RevolvingUtilizationOfUnsecuredLines",
    "age": "age",
    "number_of_time_30_59_days_past_due_not_worse": "NumberOfTime30-59DaysPastDueNotWorse",
    "debt_ratio": "DebtRatio",
    "monthly_income": "MonthlyIncome",
    "number_of_open_credit_lines_and_loans": "NumberOfOpenCreditLinesAndLoans",
    "number_of_times_90_days_late": "NumberOfTimes90DaysLate",
    "number_real_estate_loans_or_lines": "NumberRealEstateLoansOrLines",
    "number_of_time_60_89_days_past_due_not_worse": "NumberOfTime60-89DaysPastDueNotWorse",
    "number_of_dependents": "NumberOfDependents",
}

def preprocess(application_dict: dict) -> pd.DataFrame:
    """
    Convert Pydantic ApplicationInput dict to properly preprocessed DataFrame.
    Matches the exact preprocessing applied during model training in Phase 1.
    """
    # Step 1: Rename keys from snake_case to training feature names
    renamed_dict = {FEATURE_NAME_MAPPING[k]: v for k, v in application_dict.items()}

    #step 2 create one row dataframe
    df = pd.DataFrame([renamed_dict])

    #step 3 create missingness flags before imputation
    df["MonthlyIncome_missing"] = df["MonthlyIncome"].isnull().astype(int)
    df["NumberOfDependents_missing"] = df["NumberOfDependents"].isnull().astype(int)

    # step 4 fill missing values using training medians
    df["MonthlyIncome"] = df["MonthlyIncome"].fillna(imputation_values["MonthlyIncome"])
    df["NumberOfDependents"] = df["NumberOfDependents"].fillna(imputation_values["NumberOfDependents"])

    # step 5 reorder columns to match training feature order
    df = df[feature_order]
    
    return df

def get_top_shap_features(row_index: int, shap_explanation) -> list[dict]:
    """
    Extract top N feature contributions from SHAP explanation for a single row.
    Returns list of dicts with feature name, value, SHAP contribution, and direction.
    """
    feature_info = []

    # Get the SHAP explanation for one row
    row_shap = shap_explanation[row_index]

    # loop through each feature
    for feature_name, feature_value, shap_value in zip(
        row_shap.feature_names,
        row_shap.data,
        row_shap.values
    ):
        feature_info.append({
            "feature": feature_name,
            "value": float(feature_value),
            "shap_contribution": float(shap_value),
            "impact": (
                "increases_risk"
                if shap_value > 0
                else "decreases_risk"
            )
        })

    #sort by absolute SHAP value 
    feature_info = sorted(
        feature_info,
        key=lambda x: abs(x["shap_contribution"]),
        reverse=True
    )

    #return top 5 features
    return feature_info[:5]

def predict_and_explain(application_dict: dict) -> dict:
    """
    Take raw application data, predict risk probability, and generate SHAP explanation.
    Returns dict ready for PredictionOutput Pydantic model.
    """

    #preprocess
    df = preprocess(application_dict)

    # get probability
    risk_probability = model.predict_proba(df)[0, 1]

    #get shap explaination for this row
    shap_values = explainer(df)
    top_features = get_top_shap_features(0, shap_values)

    return {
        "risk_probability": float(risk_probability),
        "top_features": top_features
    }

