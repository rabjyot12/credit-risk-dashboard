async function loadPredictionDetail(predictionId) {
    try {
        const prediction = await fetchPredictionDetail(predictionId);

        renderPredictionSummary(prediction);
        renderShapBreakdown(prediction.top_features);
        renderReviewHistory(prediction.reviews);
        renderReviewForm(prediction);

    } catch (error) {
        document.getElementById("prediction-summary").textContent =
            `Error: ${error.message}`;

        document.getElementById("shap-section").textContent = "";
        document.getElementById("review-history").textContent = "";
        document.getElementById("new-review").textContent = "";
    }
}


function renderPredictionSummary(prediction) {
    const container = document.getElementById("prediction-summary");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Prediction Summary";

    const probability = document.createElement("p");
    probability.textContent =
        `Risk Probability: ${(prediction.risk_probability * 100).toFixed(2)}%`;

    const riskLevel = riskLevelFromProbability(
        prediction.risk_probability
    );

    const risk = document.createElement("p");
    risk.textContent = `Risk Level: ${riskLevel}`;

    const model = document.createElement("p");
    model.textContent =
        `Model Version: ${prediction.model_version}`;

    const date = document.createElement("p");
    date.textContent =
        `Predicted At: ${new Date(prediction.predicted_at).toLocaleString()}`;

    container.appendChild(title);
    container.appendChild(probability);
    container.appendChild(risk);
    container.appendChild(model);
    container.appendChild(date);
}


function renderShapBreakdown(topFeatures) {
    const container = document.getElementById("shap-section");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Why did the model make this prediction?";

    container.appendChild(title);

    const disclaimer = document.createElement("p");
    disclaimer.textContent = "Bars show each factor's relative influence on this prediction, not a percentage of risk.";
    disclaimer.style.fontSize = "0.85em";
    disclaimer.style.color = "#666";
    container.appendChild(disclaimer);

    if (!topFeatures || topFeatures.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No feature explanation available.";
        container.appendChild(message);
        return;
    }

    // Find the largest absolute SHAP contribution
    const maxShap = Math.max(
        ...topFeatures.map(
            feature => Math.abs(feature.shap_contribution)
        )
    );

    topFeatures.forEach(feature => {
        const featureContainer = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = feature.feature;

        const value = document.createElement("p");
        value.textContent = `Value: ${feature.value}`;

        const contribution = document.createElement("p");
        contribution.textContent =
            `SHAP Contribution: ${feature.shap_contribution.toFixed(4)}`;

        const impact = document.createElement("p");
        impact.textContent =
            feature.impact === "increases_risk"
                ? "↑ Increases Risk"
                : "↓ Decreases Risk";

        const barContainer = document.createElement("div");

        const bar = document.createElement("div");

        const barWidth =
            maxShap === 0
                ? 0
                : (Math.abs(feature.shap_contribution) / maxShap) * 100;

        bar.style.width = `${barWidth}%`;
        bar.style.height = "12px";

        if (feature.impact === "increases_risk") {
            bar.style.backgroundColor = "#dc3545";
        } else {
            bar.style.backgroundColor = "#198754";
        }

        barContainer.appendChild(bar);

        featureContainer.appendChild(name);
        featureContainer.appendChild(value);
        featureContainer.appendChild(contribution);
        featureContainer.appendChild(impact);
        featureContainer.appendChild(barContainer);

        container.appendChild(featureContainer);
    });
}


function renderReviewHistory(reviews) {
    const container = document.getElementById("review-history");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Review History";
    container.appendChild(title);

    if (!reviews || reviews.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No reviews yet.";
        container.appendChild(message);
        return;
    }

    reviews.forEach(review => {
        const reviewContainer = document.createElement("div");

        const reviewer = document.createElement("p");
        reviewer.textContent =
            `Reviewer: ${review.reviewer_id}`;

        // Decision badge
        const decision = document.createElement("p");

        const decisionLabel = document.createElement("strong");
        decisionLabel.textContent = "Decision: ";

        const badge = document.createElement("span");
        const reviewDecision = review.decision;

        badge.classList.add("badge");

        if (reviewDecision === "approve") {
            badge.classList.add("badge-approved");
        } else if (reviewDecision === "reject") {
            badge.classList.add("badge-rejected");
        } else {
            badge.classList.add("badge-pending");
        }

        badge.textContent = decisionBadge(reviewDecision);

        decision.appendChild(decisionLabel);
        decision.appendChild(badge);

        const date = document.createElement("p");
        date.textContent =
            `Reviewed At: ${new Date(review.reviewed_at).toLocaleString()}`;

        reviewContainer.appendChild(reviewer);
        reviewContainer.appendChild(decision);
        reviewContainer.appendChild(date);

        if (review.override_reason) {
            const reason = document.createElement("p");
            reason.textContent =
                `Override Reason: ${review.override_reason}`;

            reviewContainer.appendChild(reason);
        }

        container.appendChild(reviewContainer);
    });
}


function renderReviewForm(prediction) {
    const container = document.getElementById("new-review");

    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Submit Review";

    const form = document.createElement("form");

    const reviewerLabel = document.createElement("label");
    reviewerLabel.textContent = "Reviewer ID";

    const reviewerInput = document.createElement("input");
    reviewerInput.type = "text";
    reviewerInput.id = "reviewer-id";
    reviewerInput.required = true;

    const decisionLabel = document.createElement("label");
    decisionLabel.textContent = "Decision";

    const decisionSelect = document.createElement("select");
    decisionSelect.id = "review-decision";
    decisionSelect.required = true;

    const approveOption = document.createElement("option");
    approveOption.value = "approve";
    approveOption.textContent = "Approve";

    const rejectOption = document.createElement("option");
    rejectOption.value = "reject";
    rejectOption.textContent = "Reject";

    decisionSelect.appendChild(approveOption);
    decisionSelect.appendChild(rejectOption);

    const reasonLabel = document.createElement("label");
    reasonLabel.textContent = "Override Reason";

    const reasonInput = document.createElement("textarea");
    reasonInput.id = "override-reason";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Submit Review";

    form.appendChild(reviewerLabel);
    form.appendChild(reviewerInput);

    form.appendChild(decisionLabel);
    form.appendChild(decisionSelect);

    form.appendChild(reasonLabel);
    form.appendChild(reasonInput);

    form.appendChild(submitButton);

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        try {
            const reviewData = {
                prediction_id: prediction.prediction_id,
                decision: decisionSelect.value,
                reviewer_id: reviewerInput.value,
                override_reason: reasonInput.value.trim() || null
            };


            await submitReview(reviewData);

            // Backend is the source of truth.
            await loadPredictionDetail(prediction.prediction_id);

        } catch (error) {
            alert(`Could not submit review: ${error.message}`);
        }
    });

    container.appendChild(title);
    container.appendChild(form);
}


function riskLevelFromProbability(probability) {
    const percentage = probability * 100;

    if (percentage < 30) {
        return "Low";
    }

    if (percentage < 50) {
        return "Medium";
    }

    return "High";
}