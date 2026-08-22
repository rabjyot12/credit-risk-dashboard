# Credit Risk Scoring with Explainability Dashboard

A full-stack, human-in-the-loop credit risk scoring system. An XGBoost model predicts loan default risk, SHAP explains *why* it made that prediction, and a human reviewer makes the final approve/reject call — with every prediction and decision permanently logged in an audit trail.

**Live demo:** https://credit-risk-dashboard-pink.vercel.app/
**Backend API docs:** https://credit-risk-dashboard-avua.onrender.com/docs

> **Note on first load:** both the frontend and backend run on free-tier hosting that spins down after inactivity. The very first request after a period of no traffic can take up to ~60 seconds (backend cold start) plus a brief database wake-up (Neon). This is expected — give it a moment on first visit.

---

## What this project does

1. A reviewer submits a loan applicant's financial data through the dashboard.
2. A trained XGBoost model scores the applicant's default risk and generates a SHAP explanation showing which factors drove the prediction and in which direction.
3. The reviewer sees the risk score, the top contributing factors, and approves or rejects the application — optionally overriding the model's implied recommendation with a documented reason.
4. Every application, prediction, and review decision is stored as an immutable, timestamped record, so the full history of any case — including re-reviews — can always be reconstructed.

## Architecture

```
Applicant data (frontend form)
        │
        ▼
FastAPI backend  ──►  PostgreSQL (Neon)
        │                 applications
        ▼                 predictions
XGBoost + SHAP            reviews
        │
        ▼
Prediction + explanation
        │
        ▼
Reviewer dashboard (approve/reject, with audit trail)
```

- **Model layer:** XGBoost classifier trained on the Kaggle "Give Me Some Credit" dataset, wrapped with a SHAP `TreeExplainer` for per-applicant, human-readable explanations.
- **Database:** PostgreSQL, three normalized tables (`applications`, `predictions`, `reviews`), all append-only — nothing is ever overwritten, so the audit trail is permanent. `applications` supports versioned corrections; `predictions` allows re-scoring the same application over time; `reviews` allows multiple review rounds (e.g. escalation or re-review) per prediction.
- **Backend:** FastAPI, with Pydantic-validated request/response schemas, parameterized SQL (no injection risk), and business-rule enforcement (e.g. an overriding review decision requires a written reason).
- **Frontend:** Single-page vanilla HTML/CSS/JS dashboard — no framework, no build step. Renders the prediction list, a diverging SHAP bar chart per applicant, and the review workflow.

## Tech stack

| Layer | Technology |
|---|---|
| Model | Python, XGBoost, SHAP, scikit-learn, pandas |
| Backend | FastAPI, Pydantic, psycopg2 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| Frontend | HTML, CSS, vanilla JavaScript |
| Hosting | Render (backend), Vercel (frontend), Neon (database) |

## Project structure

```
├── model/
│   ├── train.ipynb          # training pipeline: EDA, feature engineering, model + SHAP
│   ├── artifacts/            # trained model, imputation values, feature order (committed — see note below)
│   └── data/                  # raw dataset (gitignored — see setup below)
├── backend/
│   ├── main.py                 # FastAPI app and endpoints
│   ├── schemas.py               # Pydantic request/response models
│   ├── db/
│   │   ├── schema.sql             # full database schema (source of truth)
│   │   └── database.py             # PostgreSQL connection handling
│   ├── models/
│   │   └── ml_model.py              # loads artifacts, preprocesses input, runs prediction + SHAP
│   └── tests/
│       └── test_model.py              # regression tests for the prediction pipeline
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── config.js      # API base URL (environment-specific)
        ├── api.js           # all backend fetch calls
        ├── dashboard.js       # prediction list view
        ├── review.js           # SHAP breakdown + review submission
        ├── application.js       # new application form
        └── app.js                 # view routing and shared state
```

## Running it locally

**1. Clone and set up a virtual environment**
```bash
git clone https://github.com/rabjyot12/credit-risk-dashboard.git
cd credit-risk-dashboard
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

**2. Set up the database**

Create a local PostgreSQL database, then run `backend/db/schema.sql` against it (via pgAdmin's Query Tool or `psql`) to create the three tables.

**3. Configure environment variables**

Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<credit_risk_db>
```

**4. (Optional) Retrain the model from scratch**

The trained model artifacts are already included in `model/artifacts/`. To regenerate them yourself:
- Download the [Give Me Some Credit dataset](https://www.kaggle.com/c/GiveMeSomeCredit/data) from Kaggle
- Place `cs-training.csv` in `model/data/`
- Run `model/train.ipynb` top to bottom

**5. Run the backend**
```bash
uvicorn backend.main:app --reload
```
API docs available at `http://127.0.0.1:8000/docs`.

**6. Run the frontend**

Set `API_BASE` in `frontend/js/config.js` to `http://127.0.0.1:8000`, then serve `frontend/index.html` with any static server (e.g. VS Code's Live Server extension).

## A note on committed model artifacts

`model/artifacts/*.pkl` are committed directly to this repository, despite the general practice of keeping trained-model binaries out of version control. This is a deliberate, documented exception: the combined artifacts are under 1MB, they're version-locked to the exact training run recorded in `train.ipynb`, and committing them avoids introducing an external storage dependency (S3, a model registry, etc.) for a model this small. At a larger scale, these would be shipped via external artifact storage instead.

## Known limitations / future improvements

- **No authentication** — `reviewer_id` is a free-text field with no login system. A production version would require real auth and role-based access.
- **Free-tier hosting cold starts** — both Render (backend) and Neon (database, scale-to-zero) sleep after inactivity, causing a slower first request. Fine for a portfolio demo, not appropriate for a production system with real users.
- **Single model version** — `model_version` is tracked in the schema but there's currently only ever one trained model live at a time; no A/B comparison or rollback tooling yet.
- **No pagination on review history** — a prediction with a very long re-review history would return all reviews in one response. Not a problem at current scale.
- **Detail endpoint added on demand** — `GET /predictions/{id}` was deliberately built only once the frontend needed it, rather than speculatively up front.

## Design decisions worth highlighting

- **Append-only audit trail:** `applications`, `predictions`, and `reviews` never update existing rows — corrections and re-reviews always create new rows, so the full history of any decision is always reconstructable, which was a core requirement for a finance-flavored, human-in-the-loop system.
- **SHAP in log-odds space:** SHAP contributions from XGBoost are in log-odds, not probability — this is made explicit both in code comments and directly in the dashboard UI, rather than silently mislabeling the values as risk percentages.
- **Business logic kept out of SQL:** the "override reason required when disagreeing with the model" rule depends on cross-table logic and a threshold that may change — it's enforced in the API layer, not as a database constraint, while still keeping simpler constraints (like `decision IN ('approve', 'reject')`) at the database level as a backup.