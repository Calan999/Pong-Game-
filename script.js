const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const WIN_SCORE = 3;

let gameOver = false;

const playerColors =
    Math.random() > 0.5
        ? ["red", "blue"]
        : ["blue", "red"];

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

class Paddle {
    constructor(x, color) {
        this.x = x;
        this.y = HEIGHT / 2 - 60;
        this.width = 15;
        this.height = 120;
        this.speed = 7;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;

        this.radius = 10;

        this.speed = 5;

        this.dx =
            Math.random() > 0.5
                ? this.speed
                : -this.speed;

        this.dy =
            (Math.random() - 0.5) * 4;
    }

    draw() {
        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (
            this.y < this.radius ||
            this.y > HEIGHT - this.radius
        ) {
            this.dy *= -1;
        }
    }
}

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 100;

        this.x =
            Math.random() *
            (WIDTH - 300) +
            150;

        this.y =
            Math.random() *
            (HEIGHT - 100);
    }

    draw() {
        ctx.fillStyle = "gray";

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

const paddle1 =
    new Paddle(30, playerColors[0]);

const paddle2 =
    new Paddle(
        WIDTH - 45,
        playerColors[1]
    );

const ball = new Ball();

let obstacle = null;

let p1Score = 0;
let p2Score = 0;

function spawnObstacle() {
    obstacle = new Obstacle();

    setTimeout(() => {
        obstacle = null;
    }, 5000);
}

setInterval(() => {
    spawnObstacle();
}, 8000);

function movePlayers() {

    if (keys["w"]) {
        paddle1.y -= paddle1.speed;
    }

    if (keys["s"]) {
        paddle1.y += paddle1.speed;
    }

    if (keys["ArrowUp"]) {
        paddle2.y -= paddle2.speed;
    }

    if (keys["ArrowDown"]) {
        paddle2.y += paddle2.speed;
    }

    paddle1.y = Math.max(
        0,
        Math.min(
            HEIGHT - paddle1.height,
            paddle1.y
        )
    );

    paddle2.y = Math.max(
        0,
        Math.min(
            HEIGHT - paddle2.height,
            paddle2.y
        )
    );
}

function paddleCollision(paddle) {

    if (
        ball.x - ball.radius <
            paddle.x + paddle.width &&
        ball.x + ball.radius >
            paddle.x &&
        ball.y >
            paddle.y &&
        ball.y <
            paddle.y + paddle.height
    ) {

        let hitPos =
            (ball.y -
                (paddle.y +
                    paddle.height / 2))
            /
            (paddle.height / 2);

        ball.dx *= -1;

        ball.dy += hitPos * 3;

        ball.speed += 0.3;

        ball.dx =
            Math.sign(ball.dx) *
            ball.speed;
    }
}

function obstacleCollision() {

    if (!obstacle) return;

    if (
        ball.x + ball.radius >
            obstacle.x &&
        ball.x - ball.radius <
            obstacle.x +
                obstacle.width &&
        ball.y + ball.radius >
            obstacle.y &&
        ball.y - ball.radius <
            obstacle.y +
                obstacle.height
    ) {
        ball.dx *= -1;
    }
}

function scoreCheck() {
 //Wenn der Ball in die end zone kommt , gibt es ein Punkt 
    if (ball.x < 0) {
        p2Score++;
        updateScore();
        ball.reset();
    }

    if (ball.x > WIDTH) {
        p1Score++;
        updateScore();
        ball.reset();
    }

    if (
        p1Score >= WIN_SCORE ||
        p2Score >= WIN_SCORE
    ) {
        gameOver = true;

        const winner =
            p1Score > p2Score
                ? "Player 1"
                : "Player 2";

        document.getElementById(
            "winner"
        ).innerText =
            winner + " Wins!";
    }
}

function updateScore() {
    document.getElementById(
        "p1Score"
    ).textContent = p1Score;

    document.getElementById(
        "p2Score"
    ).textContent = p2Score;
}

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    paddle1.draw();
    paddle2.draw();

    ball.draw();

    if (obstacle) {
        obstacle.draw();
    }
}

function update() {

    if (gameOver) return;

    movePlayers();

    ball.update();

    paddleCollision(paddle1);
    paddleCollision(paddle2);

    obstacleCollision();

    scoreCheck();
}

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

gameLoop();