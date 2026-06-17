const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const WIN_SCORE = 3;

let state = "menu";

let scoreP1 = 0;
let scoreP2 = 0;

let speedLevel = 0;

let isCountingDown = false;

let unlockedAchievements = [];

let p1Name = "";
let p2Name = "";

let keys = {};

let trail = [];
const TRAIL_LENGTH = 12;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ---------------- PADDLE ----------------
class Paddle {
    constructor(x, name, color) {
        this.x = x;
        this.y = H / 2 - 60;
        this.w = 15;
        this.h = 120;
        this.speed = 8;
        this.name = name;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(this.name, this.x + this.w / 2, this.y - 10);
    }

    move(up, down) {
        if (state !== "play") return;

        if (keys[up]) this.y -= this.speed;
        if (keys[down]) this.y += this.speed;

        this.y = Math.max(0, Math.min(H - this.h, this.y));
    }
}

// ---------------- BALL ----------------
class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = W / 2;
        this.y = H / 2;

        this.speed = 7;
        this.dx = Math.random() > 0.5 ? this.speed : -this.speed;
        this.dy = (Math.random() - 0.5) * 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    update() {
        if (state !== "play") return;

        this.x += this.dx;
        this.y += this.dy;

        // save trail
        trail.push({ x: this.x, y: this.y });

        if (trail.length > TRAIL_LENGTH) {
            trail.shift();
        }

        if (this.y < 10 || this.y > H - 10) {
            this.dy *= -1;
        }
    }
}

// ---------------- OBSTACLE ----------------
class Obstacle {
    constructor() {
        this.w = 30;
        this.h = 120;

        this.x = Math.random() * (W - 600) + 300;
        this.y = Math.random() * (H - 200) + 100;

        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.speed = 1;
    }

    update() {
        this.y += this.speed * this.direction;

        if (this.y <= 0 || this.y + this.h >= H) {
            this.direction *= -1;
        }
    }

    draw() {
        ctx.fillStyle = "gray";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

//---------------- Spawn Obstacles -----------------------

function spawnObstacles() {

    obstacles = [];

    let count = 2 + Math.floor(scoreP1 / 1500);

    count = Math.min(count, 5);

    console.log("Score:", scoreP1);
    console.log("Obstacle count:", count);


    for (let i = 0; i < count; i++) {

        let attempts = 0;
        let o;

        do {
            o = new Obstacle();
            attempts++;
        }
        while (
            obstacles.some(existing =>
                isTooClose(o, existing)
            ) &&
            attempts < 50
        );

        obstacles.push(o);
    }
}

let ball, left, right;
let obstacles = [];

// ---------------- INIT ----------------
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

// ---------------- COUNTDOWN ----------------
function countdown() {
    if (isCountingDown) return;   // ⭐ verhindert doppelte Starts

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
            isCountingDown = false;  // ⭐ wieder freigeben
        }

    }, 1000);
}

// ---------------- OBSTACLES ----------------
function isTooClose(o1, o2, minDistance = 40) {
    return !(
        o1.x + o1.w + minDistance < o2.x ||
        o1.x > o2.x + o2.w + minDistance ||
        o1.y + o1.h + minDistance < o2.y ||
        o1.y > o2.y + o2.h + minDistance
    );
}

setInterval(() => {
    if (state === "play") {
        spawnObstacles();
    }
}, 6000);

// ---------------- COLLISION ----------------
function hitPaddle(p) {
    if (
        ball.x < p.x + p.w &&
        ball.x > p.x &&
        ball.y > p.y &&
        ball.y < p.y + p.h
    ) {
        // where on paddle did we hit?
        let hitPos = (ball.y - p.y) / p.h; // 0 (top) → 1 (bottom)

        // convert to angle range (-1 to 1)
        let angle = (hitPos - 0.5) * 2;

        ball.dx = -ball.dx;

        // apply angle influence
        ball.dy = angle * 6;

        // slight speed increase
        ball.dx *= 1.03;
    }
}

// ---------------- OBSTACLE COLLISION ----------------
function hitObstacle(o) {

    if (
        ball.x + 10 > o.x &&
        ball.x - 10 < o.x + o.w &&
        ball.y + 10 > o.y &&
        ball.y - 10 < o.y + o.h
    ) {
        ball.dx *= -1;

        if (ball.x < o.x) {
            ball.x = o.x - 10;
        } else {
            ball.x = o.x + o.w + 10;
        }
    }
}

// ---------------- SCORE ----------------
function score() {

    if (state !== "play") return;

    if (gameMode === "multi") {

        if (ball.x < 0) {
            scoreP2++;
            reset();
        }

        if (ball.x > W) {
            scoreP1++;
            reset();
        }

        updateScore();

        if (scoreP1 >= WIN_SCORE || scoreP2 >= WIN_SCORE) {
            win();
        }
    }
    if (gameMode === "single") {

        // ❌ PLAYER MISSES BALL (GAME OVER CONDITION)
        if (ball.x < 0) {

            state = "gameover";

            document.getElementById("loseMessage")
                .classList.remove("hidden");

            document.getElementById("gameOver")
                .classList.remove("hidden");

            return;
        }

        // ✔ SCORE PROGRESSION (SURVIVAL MODE)
        if (ball.x >= W - 10) {

            ball.x = W - 10;
            ball.dx *= -1;

            scoreP1 += 100;

            updateScore();
            checkSpeedIncrease();

            if (gameMode === "single") {
                checkAchievements();
            }
        }
    }
}

// ---------------- RESET ----------------
function reset() {
    ball.reset();
    state = "countdown";

    setTimeout(() => {
        countdown();
    }, 50);
}

// ---------------- WIN ----------------
function win() {

    state = "win";

    let winner = scoreP1 > scoreP2 ? p1Name : p2Name;

    // ❌ hide game screen so it doesn't overlap
    document.getElementById("gameScreen").classList.add("hidden");

    // ❌ ensure other overlays are hidden (safety reset)
    document.getElementById("loseMessage").classList.add("hidden");
    document.getElementById("gameOver").classList.add("hidden");

    // ✔ show win screen
    document.getElementById("winText").innerText =
        winner + " Wins!";

    document.getElementById("win").classList.remove("hidden");

    save(winner);
}

// ---------------- START MODES ----------------
let gameMode = "menu";

// ---------------- LEADERBOARD ----------------

function openLeaderboard() {

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("leaderboard").classList.remove("hidden");

    let data = JSON.parse(localStorage.getItem("lb")) || [];

    // sort best first
    data.sort((a, b) => b.points - a.points);

    // keep only top 10
    data = data.slice(0, 10);

    let board = document.getElementById("board");
    board.innerHTML = "";

    data.forEach((p, i) => {
        let div = document.createElement("div");
        div.innerText = `${i + 1}. ${p.name} - ${p.points} pts`;
        board.appendChild(div);
    });
}


// ---------------- UI ----------------
function updateScore() {

    if (gameMode === "multi") {
        document.getElementById("score").innerText =
            scoreP1 + " : " + scoreP2;
    }

    if (gameMode === "single") {
        document.getElementById("score").innerText =
            "Score: " + scoreP1;
    }
}

// ---------------- START ----------------

function startMulti() {
    gameMode = "multi";
    startGameBase();
}

function startSingle() {
    gameMode = "single";

    // scoreP1 = 0;
    // speedLevel = 0;

    // init();
    // state = "play";

    startGameBase();
}

function startGameBase() {

    p1Name = document.getElementById("p1").value || "P1";
    p2Name = document.getElementById("p2").value || "P2";

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");

    init();

    if (gameMode === "multi") {
        countdown();
    } else {
        state = "play";
    }
}

// ---------------- SPEED ----------------
function checkSpeedIncrease() {

    let newLevel = Math.floor(scoreP1 / 500);

    if (newLevel > speedLevel) {
        speedLevel = newLevel;
        ball.dx *= 1.07;
        ball.dy *= 1.07;
    }
}

// ---------------- LOOP ----------------
function loop() {

    ctx.clearRect(0, 0, W, H);

    if (state === "play") {

        left.move("w", "s");

        if (gameMode !== "single") {
            right.move("ArrowUp", "ArrowDown");
        }

        ball.update();

        hitPaddle(left);

        if (gameMode !== "single") {
            hitPaddle(right);
        }

        obstacles.forEach(o => {

            o.update();

            hitObstacle(o);

            o.draw();
        });

        score();
    }

    if (state === "play" || state === "countdown") {

        left.draw();

        if (gameMode !== "single") {
            right.draw();
        }
        ball.draw();
    
    }

    requestAnimationFrame(loop);

} // <-- DIESE KLAMMER FEHLTE

loop();

// ---------------- NAV ----------------
function restart() {

    // hide win screen
    document.getElementById("win").classList.add("hidden");

    // reset game state
    scoreP1 = 0;
    scoreP2 = 0;
    speedLevel = 0;

    state = "menu";

    // restart clean game
    startGameBase();
}

function backMenu() {
    location.reload();
}

// ---------------- SCORE UI ----------------
function updateScore() {

    if (gameMode === "multi") {
        document.getElementById("score").innerText =
            scoreP1 + " : " + scoreP2;
    }

    if (gameMode === "single") {
        document.getElementById("score").innerText =
            "Score: " + scoreP1;
    }
}

function retrySingle() {

    // hide UI overlays properly
    document.getElementById("gameOver").classList.add("hidden");
    document.getElementById("loseMessage").classList.add("hidden");

    // reset game state fully
    state = "play";
    gameMode = "single";

    // reset scores
    scoreP1 = 0;
    speedLevel = 0;

    // reset objects
    obstacles = [];

    // reinitialize game objects
    init();

    // IMPORTANT: force fresh ball state
    ball.reset();
}

// ---------------- ACHIEVEMENTS ----------------
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

    const achievements = [
        { score: 500, name: "Boi" },
        { score: 1000, name: "Challenger" },
        { score: 2500, name: "Veteran" },
        { score: 5000, name: "Master" },
        { score: 10000, name: "Legend" }
    ];

    for (let a of achievements) {

        if (
            scoreP1 >= a.score &&
            !unlockedAchievements.includes(a.name)
        ) {
            unlockedAchievements.push(a.name);
            showToast(a.name);
        }
    }
}

function save(name, points) {

    let data = JSON.parse(localStorage.getItem("lb")) || [];

    let p = data.find(x => x.name === name);

    if (p) p.points += 5;
    else data.push({ name, points: 5 });

    localStorage.setItem("lb", JSON.stringify(data));

    fetch("http://localhost:3000/score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            points: 5
        })
    });
}

async function loadLeaderboard() {

    const res = await fetch("http://localhost:3000/leaderboard");
    const data = await res.json();

    console.log(data);
}

const bg = document.getElementById("bg");
const bctx = bg.getContext("2d");

bg.width = window.innerWidth;
bg.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * bg.width,
        y: Math.random() * bg.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1,
        hue: Math.random() * 160 + 160 // blue/green range
    });
}

function animateBG() {
    bctx.clearRect(0, 0, bg.width, bg.height);

    for (let p of particles) {

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > bg.width) p.dx *= -1;
        if (p.y < 0 || p.y > bg.height) p.dy *= -1;

        // soft glow effect
        const gradient = bctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.r * 4
        );

        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);

        bctx.beginPath();
        bctx.fillStyle = gradient;
        bctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        bctx.fill();
    }

    requestAnimationFrame(animateBG);
}
animateBG();

function drawTrail() {
    for (let i = 0; i < trail.length; i++) {
        let p = trail[i];
        let alpha = i / trail.length;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 213, ${alpha * 0.4})`;
        ctx.fill();
    }
}
