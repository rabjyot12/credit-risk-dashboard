const API_BASE = "http://127.0.0.1:8000";

async function fetchPredictions(page = 1, pagesize = 20) {
    try {
        const response = await fetch(
            `${API_BASE}/predictions?page=${page}&pagesize=${pagesize}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch predictions: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        throw new Error(`Could not connect to the API: ${error.message}`);
    }
    
}

async function submitApplication(applicationData) {
    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit application: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        throw new Error(`Could not submit application: ${error.message}`);
    }
}

async function submitReview(reviewData) {
    try {
        const response = await fetch(`${API_BASE}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit review: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        throw new Error(`Could not submit review: ${error.message}`);
    }
}

async function fetchPredictionDetail(predictionId) {
    try {
        const response = await fetch(
            `${API_BASE}/predictions/${predictionId}`
        );

        if (!response.ok) {
            let detail = `HTTP ${response.status}`;

            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    detail = errorData.detail;
                }
            } catch {
                // Keep the HTTP status if the response isn't valid JSON
            }

            throw new Error(detail);
        }

        return await response.json();

    } catch (error) {
        throw new Error(
            `Could not load prediction details: ${error.message}`
        );
    }
}
