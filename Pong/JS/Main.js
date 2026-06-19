function init() {
    scoreP1 = 0;
    scoreP2 = 0;

    left = new Paddle(30, p1Name, "red");

    if (gameMode !== "single") {
        right = new Paddle(W - 45, p2Name, "dodgerblue");
    }

    ball = new Ball();
    obstacles = [];

    spawnObstacles();
}

function countdown() {
    if (isCountingDown) return;

    isCountingDown = true;
    state = "countdown";

    let c = 3;
    document.getElementById("countdown").innerText = c;

    let t = setInterval(() => {
        c--;

        if (c > 0) {
            document.getElementById("countdown").innerText = c;
        } else if (c === 0) {
            document.getElementById("countdown").innerText = "GO!";
        } else {
            document.getElementById("countdown").innerText = "";
            clearInterval(t);
            state = "play";
            isCountingDown = false;
        }
    }, 1000);
}

function startGameBase() {

    p1Name = document.getElementById("p1").value || "P1";
    p2Name = document.getElementById("p2").value || "P2";

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");

    init();

    if (gameMode === "multi") countdown();
    else state = "play";
}

function startMulti() {
    gameMode = "multi";
    startGameBase();
}

function startSingle() {
    gameMode = "single";
    startGameBase();
}

loop();
requestAnimationFrame(loop);