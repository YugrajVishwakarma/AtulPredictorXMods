let historyData = [];
let lastFetchedPeriod = 0;
let totalWins = 0, totalLosses = 0;

// ✅ Real-time 60-second sync
function updateTimer() {
    let now = new Date();
    let seconds = now.getUTCSeconds();
    let remainingSeconds = 60 - seconds;

    document.getElementById("timer").innerText = remainingSeconds;

    if (remainingSeconds === 60) {
        updatePrediction(); // Fetch data exactly when 60 seconds reset
    }

    setTimeout(updateTimer, 1000);
}

// ✅ Fetch latest game result
async function fetchGameResult() {
    try {
        const response = await fetch("https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pageSize: 10,
                pageNo: 1,
                typeId: 1,
                language: 0,
                random: "4a0522c6ecd8410496260e686be2a57c",
                signature: "334B5E70A0C9B8918B0B15E517E2069C",
                timestamp: Math.floor(Date.now() / 1000)
            })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();
        let latestResult = data?.data?.list?.[0];

        return latestResult ? { period: latestResult.issueNumber, result: latestResult.number } : null;
    } catch (error) {
        console.error("Error fetching game result:", error);
        return null;
    }
}

// ✅ Predict based on history
function trendAnalysis(history) {
    let bigCount = history.filter(item => item.result >= 5).length;
    let smallCount = history.filter(item => item.result < 5).length;
    return bigCount > smallCount ? "BIG" : "SMALL";
}

// ✅ Auto Prediction System
function autoPredict() {
    return { type: trendAnalysis(historyData) };
}

// ✅ Update Prediction & History
async function updatePrediction() {
    let apiResult = await fetchGameResult();

    if (apiResult && apiResult.period !== lastFetchedPeriod) {
        lastFetchedPeriod = apiResult.period;
        let currentPeriod = (BigInt(apiResult.period) + 1n).toString();
        let prediction = autoPredict();

        document.getElementById("currentPeriod").innerText = currentPeriod;
        document.getElementById("prediction").innerText = prediction.type;

        historyData.unshift({ 
            period: currentPeriod, 
            result: apiResult.result, 
            prediction: prediction.type, 
            resultStatus: "Pending" 
        });

        updateHistory();
        checkWinLoss(apiResult);
    }
}

// ✅ Check Win/Loss Status
function checkWinLoss(apiResult) {
    if (!apiResult) return;

    historyData.forEach(item => {
        if (item.period === apiResult.period) {
            let actualResult = apiResult.result >= 5 ? "BIG" : "SMALL";
            item.resultStatus = (item.prediction === actualResult) ? "WIN" : "LOSS";
        }
    });

    updateStats();
    updateHistory();
}

// ✅ Update Statistics
function updateStats() {
    totalWins = historyData.filter(item => item.resultStatus === "WIN").length;
    totalLosses = historyData.filter(item => item.resultStatus === "LOSS").length;
    let accuracy = ((totalWins / (totalWins + totalLosses)) * 100) || 0;

    document.getElementById("totalWins").innerText = totalWins;
    document.getElementById("totalLosses").innerText = totalLosses;
    document.getElementById("accuracy").innerText = accuracy.toFixed(2) + '%';
}

// ✅ Update History Display
function updateHistory() {
    let historyDiv = document.getElementById("historyList");
    historyDiv.innerHTML = "";

    historyData.forEach(item => {
        let div = document.createElement("div");
        div.classList.add("history-item");
        div.innerHTML = `<p>📅 ${item.period}</p><p>🏆 ${item.prediction} ➡ ${item.result} (${item.resultStatus})</p>`;
        historyDiv.appendChild(div);
    });
}

// ✅ Start the real-time timer
updateTimer();
updatePrediction();
            
