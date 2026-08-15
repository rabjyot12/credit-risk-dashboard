const API_BASE = "http://127.0.0.1:8000";

async function fetchPredictions(page = 1, pagesize = 20) {
    const response = await fetch(
        `${API_BASE}/predictions?page=${page}&pagesize=${pagesize}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch predictions: ${response.status}`);
    }

    return await response.json();
}

async function submitApplication(applicationData) {
    const response = await fetch(`${API_BASE}/applications`, {
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
}

async function submitReview(reviewData) {
    const response = await fetch(`${API_BASE}/reviews`, {
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
}
