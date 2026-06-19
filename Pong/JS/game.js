function isTooClose(o1, o2, minDistance = 40) {
    return !(
        o1.x + o1.w + minDistance < o2.x ||
        o1.x > o2.x + o2.w + minDistance ||
        o1.y + o1.h + minDistance < o2.y ||
        o1.y > o2.y + o2.h + minDistance
    );
}

function spawnObstacles() {
    obstacles = [];

    let count = 2 + Math.floor(scoreP1 / 1500);
    count = Math.min(count, 5);

    for (let i = 0; i < count; i++) {

        let attempts = 0;
        let o;

        do {
            o = new Obstacle();
            attempts++;
        } while (
            obstacles.some(e => isTooClose(o, e)) &&
            attempts < 50
        );

        obstacles.push(o);
    }
}

function hitPaddle(p) {
    if (
        ball.x < p.x + p.w &&
        ball.x > p.x &&
        ball.y > p.y &&
        ball.y < p.y + p.h
    ) {
        let hitPos = (ball.y - p.y) / p.h;
        let angle = (hitPos - 0.5) * 2;

        ball.dx = -ball.dx;
        ball.dy = angle * 6;
        ball.dx *= 1.03;

        shakeAmount = 3;
    }
}

function hitObstacle(o) {
    if (
        ball.x + 10 > o.x &&
        ball.x - 10 < o.x + o.w &&
        ball.y + 10 > o.y &&
        ball.y - 10 < o.y + o.h
    ) {
        ball.dx *= -1;
    }
}

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

        if (ball.x < 0) {
            state = "gameover";
            document.getElementById("loseMessage").classList.remove("hidden");
            document.getElementById("gameOver").classList.remove("hidden");
            return;
        }

        if (ball.x >= W - 10) {
            ball.x = W - 10;
            ball.dx *= -1;

            scoreP1 += 100;

            updateScore();
            checkSpeedIncrease();
            checkAchievements();
        }
    }
}

function reset() {
    ball.reset();
    state = "countdown";
    setTimeout(countdown, 50);
}

function loop() {

    ctx.clearRect(0, 0, W, H);

    if (state === "play") {

        left.move("w", "s");

        if (gameMode !== "single") {
            right.move("ArrowUp", "ArrowDown");
        }

        ball.update();

        hitPaddle(left);
        if (gameMode !== "single") hitPaddle(right);

        obstacles.forEach(o => {
            o.update();
            hitObstacle(o);
            o.draw();
        });

        score();
    }

    if (state === "play" || state === "countdown") {
        left.draw();
        if (gameMode !== "single") right.draw();
        ball.draw();
    }

    requestAnimationFrame(loop);
}