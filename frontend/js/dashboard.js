function riskLevel(probability) {
    const pct = probability * 100;

    if (pct < 30) {
        return "Low";
    }

    if (pct < 50) {
        return "Medium";
    }

    return "High";
}

function decisionBadge(decision) {
    if (decision === "approve") {
        return "APPROVED";
    }

    if (decision === "reject") {
        return "REJECTED";
    }

    return "PENDING";
}

function renderPredictionRow(prediction) {
    const row = document.createElement("tr");

    //1. Prediction ID
    const predictionCell = document.createElement("td");
    predictionCell.textContent =
        `${prediction.prediction_id.substring(0, 8)}...`;
    row.appendChild(predictionCell);

    //2. Risk Probability
    const riskCell = document.createElement("td");
    riskCell.textContent =
        `${(prediction.risk_probability * 100).toFixed(2)}%`;
    row.appendChild(riskCell);


    // 3. Risk level
    const riskLevelCell = document.createElement("td");
    riskLevelCell.textContent =
        riskLevel(prediction.risk_probability);
    row.appendChild(riskLevelCell);


    // 4. Decision
    const decisionCell = document.createElement("td");
    const badge = document.createElement("span");
    const decision = prediction.decision;
    badge.classList.add("badge");

    if (decision === "approve") {
        badge.classList.add("badge-approved");
    } else if (decision === "reject") {
        badge.classList.add("badge-rejected");
    }   else {
        badge.classList.add("badge-pending");
    }

    badge.textContent = decisionBadge(decision);
    decisionCell.appendChild(badge);
    row.appendChild(decisionCell);


    // 5. Model version
    const modelCell = document.createElement("td");
    modelCell.textContent =
        prediction.model_version;
    row.appendChild(modelCell);


    // 6. Prediction date
    const predictedCell = document.createElement("td");
    predictedCell.textContent =
        new Date(prediction.predicted_at).toLocaleString();
    row.appendChild(predictedCell);


    // 7. Reviewer
    const reviewCell = document.createElement("td");
    reviewCell.textContent =
        prediction.reviewer_id || "—";
    row.appendChild(reviewCell);


    // 8. View / Review button
    const actionCell = document.createElement("td");
    const actionButton = document.createElement("button");
    actionButton.textContent =
        prediction.decision ? "View →" : "Review →";
    actionButton.addEventListener("click", () => {
        openReview(prediction.prediction_id);
    });
    actionButton.classList.add("secondary-button");
    actionCell.appendChild(actionButton);
    row.appendChild(actionCell);

    return row;
}

async function loadDashboard(page = 1) {
    currentDashboardPage = page;
    const tbody =
        document.getElementById("predictions-table-body");

    const paginationControls =
        document.getElementById("pagination-controls");

    try {
        const data = await fetchPredictions(page);

        //clear previous page
        tbody.innerHTML = "";

        //render each prediction
        data.items.forEach(prediction => {
            tbody.appendChild(
                renderPredictionRow(prediction)
            );
        });


        //clear old pagination controls
        paginationControls.innerHTML = "";


        //previous button
        const previousButton =
            document.createElement("button");

        previousButton.textContent = "← Previous";

        previousButton.disabled =
            data.page <= 1;

        previousButton.addEventListener("click", () => {
            loadDashboard(data.page - 1);
        });
        previousButton.classList.add("secondary-button");

        paginationControls.appendChild(previousButton);


        //page information
        const pageInfo =
            document.createElement("span");

        pageInfo.textContent =
            ` Page ${data.page} of ${data.total_pages} `;

        paginationControls.appendChild(pageInfo);


        //next button
        const nextButton =
            document.createElement("button");

        nextButton.textContent = "Next →";

        nextButton.disabled =
            data.page >= data.total_pages;

        nextButton.addEventListener("click", () => {
            loadDashboard(data.page + 1);
        });
        nextButton.classList.add("secondary-button");

        paginationControls.appendChild(nextButton);

    } catch (error) {

        //clear table
        tbody.innerHTML = "";
        paginationControls.innerHTML = "";

        const errorRow = document.createElement("tr");
        const errorCell = document.createElement("td");

        errorCell.colSpan = 8;
        errorCell.textContent = `Unable to load predictions: ${error.message}`;
        errorRow.appendChild(errorCell);
        tbody.appendChild(errorRow);
    }
}

