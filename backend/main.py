from fastapi import FastAPI, HTTPException
from backend.schemas import ApplicationInput, PredictionOutput
from backend.db.database import get_connection
from backend.models.ml_model import predict_and_explain

import json     

MODEL_VERSION = "v1.0"

app = FastAPI()

@app.get("/")
def health_check():
    return{"status": "API is running"}

@app.post("/predict", response_model=PredictionOutput)
def predict(application: ApplicationInput):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        #step1 save application
        cursor.execute(
            """
            INSERT INTO applications (
                revolving_utilization_unsecured_lines,
                age,
                number_of_time_30_59_days_past_due_not_worse,
                debt_ratio,
                monthly_income,
                number_of_open_credit_lines_and_loans,
                number_of_times_90_days_late,
                number_real_estate_loans_or_lines,
                number_of_time_60_89_days_past_due_not_worse,
                number_of_dependents
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING application_id;
            """,
            (
                application.revolving_utilization_unsecured_lines,
                application.age,
                application.number_of_time_30_59_days_past_due_not_worse,
                application.debt_ratio,
                application.monthly_income,
                application.number_of_open_credit_lines_and_loans,
                application.number_of_times_90_days_late,
                application.number_real_estate_loans_or_lines,
                application.number_of_time_60_89_days_past_due_not_worse,
                application.number_of_dependents,
            )
        )
         

        application_id = cursor.fetchone()[0]

        #save the application permanently
        # Save the application permanently
        conn.commit()

        #step2 run ML model
        result = predict_and_explain(application.model_dump())

        #step3 save prediction
        cursor.execute(
            """
            INSERT INTO predictions (
                application_id,
                risk_probability,
                shap_values,
                model_version
            )
            VALUES (%s, %s, %s, %s)
            RETURNING prediction_id, predicted_at;
            """,
            (
                application_id,
                result["risk_probability"],
                json.dumps(result["top_features"]),
                MODEL_VERSION
            )
        )


        prediction_id, predicted_at = cursor.fetchone()

        #step4 commit transaction
        conn.commit()

        #step5 return API response
        return PredictionOutput(
            prediction_id=prediction_id,
            application_id=application_id,
            risk_probability=result["risk_probability"],
            top_features=result["top_features"],
            model_version=MODEL_VERSION,
            predicted_at=predicted_at,
        )

    except Exception as e:
        conn.rollback()

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
