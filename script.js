const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const WIN_SCORE = 10;
const MAX_BALL_SPEED = 18;

let keys = {};

// ---------------------
// GAME STATE
// ---------------------
let gameState = "menu"; 
// menu | playing | winner | leaderboard

let player1Name = "";
let player2Name = "";

let player1Color = "red";
let player2Color = "blue";

let p1Score = 0;
let p2Score = 0;

let gameOver = false;

// ---------------------
// INPUT
// ---------------------
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// ---------------------
// LEADERBOARD
// ---------------------
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

function saveLeaderboard() {
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function updateLeaderboard(winnerName) {
    let player = leaderboard.find(p => p.name === winnerName);

    if (player) {
        player.points += 5;
        player.wins += 1;
    } else {
        leaderboard.push({
            name: winnerName,
            points: 5,
            wins: 1
        });
    }

    leaderboard.sort((a, b) => b.points - a.points);
    saveLeaderboard();
}

// ---------------------
// PADDLE CLASS
// ---------------------
class Paddle {
    constructor(x, color) {
        this.x = x;
        this.y = HEIGHT / 2 - 60;
        this.width = 15;
        this.height = 120;
        this.speed = 8;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(upKey, downKey) {
        if (keys[upKey]) this.y -= this.speed;
        if (keys[downKey]) this.y += this.speed;

        // clamp
        this.y = Math.max(0, Math.min(HEIGHT - this.height, this.y));
    }
}

// ---------------------
// BALL CLASS
// ---------------------
class Ball {
    constructor() {
        this.radius = 10;
        this.reset();
    }

    reset() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;

        this.speed = 7;

        this.dx = Math.random() > 0.5 ? this.speed : -this.speed;
        this.dy = (Math.random() - 0.5) * 5;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // top/bottom walls
        if (this.y <= this.radius || this.y >= HEIGHT - this.radius) {
            this.dy *= -1;
        }
    }
}

// ---------------------
// OBSTACLE CLASS
// ---------------------
class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 120;

        // safe spawn zone (avoid edges)
        this.x = Math.random() * (WIDTH - 600) + 300;
        this.y = Math.random() * (HEIGHT - 150);
    }

    draw() {
        ctx.fillStyle = "#666";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

let obstacle = null;

// ---------------------
// OBJECTS
// ---------------------
let paddle1, paddle2, ball;

// ---------------------
// INIT GAME
// ---------------------
function initGame() {
    p1Score = 0;
    p2Score = 0;
    gameOver = false;

    player1Color = Math.random() > 0.5 ? "red" : "blue";
    player2Color = player1Color === "red" ? "blue" : "red";

    paddle1 = new Paddle(30, player1Color);
    paddle2 = new Paddle(WIDTH - 45, player2Color);
    ball = new Ball();

    updateScoreUI();
    startCountdown();
}

// ---------------------
// COUNTDOWN
// ---------------------
function startCountdown() {
    let count = 3;
    const countdownEl = document.getElementById("countdown");

    countdownEl.innerText = count;

    const interval = setInterval(() => {
        count--;

        if (count > 0) {
            countdownEl.innerText = count;
        } else if (count === 0) {
            countdownEl.innerText = "GO!";
        } else {
            countdownEl.innerText = "";
            clearInterval(interval);
        }
    }, 1000);
}

// ---------------------
// INPUT MOVEMENT
// ---------------------
function movePaddles() {
    paddle1.move("w", "s");
    paddle2.move("ArrowUp", "ArrowDown");
}

// ---------------------
// COLLISIONS
// ---------------------
function paddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        let hit = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);

        ball.dx *= -1;
        ball.dy = hit * 6;

        ball.speed = Math.min(ball.speed + 0.6, MAX_BALL_SPEED);

        ball.dx = Math.sign(ball.dx) * ball.speed;

        // prevent sticking
        if (ball.dx > 0) {
            ball.x = paddle.x + paddle.width + ball.radius;
        } else {
            ball.x = paddle.x - ball.radius;
        }
    }
}

function obstacleCollision() {
    if (!obstacle) return;

    if (
        ball.x + ball.radius > obstacle.x &&
        ball.x - ball.radius < obstacle.x + obstacle.width &&
        ball.y + ball.radius > obstacle.y &&
        ball.y - ball.radius < obstacle.y + obstacle.height
    ) {
        ball.dx *= -1;

        // push ball out (fix sticking)
        if (ball.dx > 0) {
            ball.x = obstacle.x + obstacle.width + ball.radius;
        } else {
            ball.x = obstacle.x - ball.radius;
        }
    }
}

// ---------------------
// SCORING
// ---------------------
function checkScore() {
    if (ball.x < 0) {
        p2Score++;
        resetBall();
    }

    if (ball.x > WIDTH) {
        p1Score++;
        resetBall();
    }

    updateScoreUI();

    if (p1Score >= WIN_SCORE || p2Score >= WIN_SCORE) {
        endGame();
    }
}

function resetBall() {
    ball.reset();
}

// ---------------------
// END GAME
// ---------------------
function endGame() {
    gameOver = true;
    gameState = "winner";

    const winnerName =
        p1Score > p2Score ? player1Name : player2Name;

    updateLeaderboard(winnerName);

    document.getElementById("winnerTitle").innerText =
        winnerName + " Wins!";

    document.getElementById("finalScore").innerText =
        `${p1Score} - ${p2Score}`;

    showScreen("winnerScreen");
}

// ---------------------
// LEADERBOARD UI
// ---------------------
function renderLeaderboard() {
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    leaderboard.forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "leaderboard-item";
        div.innerHTML = `
            <span>#${i + 1} ${p.name}</span>
            <span>${p.points} pts</span>
        `;
        list.appendChild(div);
    });
}

// ---------------------
// UI HELPERS
// ---------------------
function updateScoreUI() {
    document.getElementById("p1Score").innerText = p1Score;
    document.getElementById("p2Score").innerText = p2Score;
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// ---------------------
// OBSTACLES
// ---------------------
function spawnObstacle() {
    obstacle = new Obstacle();

    setTimeout(() => {
        obstacle = null;
    }, 5000);
}

setInterval(() => {
    if (gameState === "playing") {
        spawnObstacle();
    }
}, 8000);

// ---------------------
// GAME LOOP
// ---------------------
function update() {
    if (gameState !== "playing") return;

    movePaddles();

    ball.update();

    paddleCollision(paddle1);
    paddleCollision(paddle2);

    obstacleCollision();

    checkScore();
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gameState !== "playing") return;

    paddle1.draw();
    paddle2.draw();
    ball.draw();

    if (obstacle) obstacle.draw();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

// ---------------------
// MENU BUTTONS
// ---------------------
document.getElementById("startBtn").onclick = () => {
    player1Name = document.getElementById("player1Name").value || "Player 1";
    player2Name = document.getElementById("player2Name").value || "Player 2";

    document.getElementById("player1Display").innerText = player1Name;
    document.getElementById("player2Display").innerText = player2Name;

    document.getElementById("player1Color").innerText = player1Color;
    document.getElementById("player2Color").innerText = player2Color;

    gameState = "playing";
    showScreen("gameScreen");

    initGame();
};

document.getElementById("leaderboardBtn").onclick = () => {
    renderLeaderboard();
    showScreen("leaderboardScreen");
};

document.getElementById("backBtn").onclick = () => {
    showScreen("menuScreen");
};

document.getElementById("playAgainBtn").onclick = () => {
    gameState = "playing";
    showScreen("gameScreen");
    initGame();
};

document.getElementById("menuBtn").onclick = () => {
    gameState = "menu";
    showScreen("menuScreen");
};