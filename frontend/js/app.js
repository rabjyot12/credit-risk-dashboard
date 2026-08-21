let selectedPredictionId = null;

function showView(viewId) {
    document.getElementById("dashboard-view").style.display = "none";
    document.getElementById("review-view").style.display = "none";
    document.getElementById(viewId).style.display = "block";
}

function openReview(predictionId) {
    selectedPredictionId = predictionId;
    showView("review-view");
    loadPredictionDetail(predictionId);
}

// this is what actually kicks off the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard(1);
});

