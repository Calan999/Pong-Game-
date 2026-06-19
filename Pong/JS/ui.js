function updateScore() {
    if (gameMode === "multi") {
        document.getElementById("score").innerText =
            scoreP1 + " : " + scoreP2;
    } else {
        document.getElementById("score").innerText =
            "Score: " + scoreP1;
    }
}

function showToast(text) {
    const toast = document.getElementById("toast");
    toast.innerText = "🏆 " + text;
    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function checkAchievements() {
    const list = [
        { score: 500, name: "Boi" },
        { score: 1000, name: "Challenger" },
        { score: 2500, name: "Veteran" },
        { score: 5000, name: "Master" },
        { score: 10000, name: "Legend" }
    ];

    for (let a of list) {
        if (scoreP1 >= a.score && !unlockedAchievements.includes(a.name)) {
            unlockedAchievements.push(a.name);
            showToast(a.name);
        }
    }
}