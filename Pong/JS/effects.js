function drawTrail() {
    for (let i = 0; i < trail.length; i++) {
        let p = trail[i];
        let a = i / trail.length;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,213,${a * 0.4})`;
        ctx.fill();
    }
}

function applyShake() {
    if (shakeAmount > 0) {
        ctx.setTransform(1, 0, 0, 1,
            (Math.random() - 0.5) * shakeAmount,
            (Math.random() - 0.5) * shakeAmount
        );

        shakeAmount *= 0.9;
    } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    requestAnimationFrame(applyShake);
}
applyShake();

let glowT = 0;

function ballGlowPulse() {
    glowT += 0.05;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glow = 20 + Math.sin(glowT) * 8;

    ctx.beginPath();
    ctx.arc(ball ? ball.x : W/2, ball ? ball.y : H/2, glow, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,255,213,0.05)";
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(ballGlowPulse);
}
ballGlowPulse();

let hue = 180;

function colorShift() {
    hue += 0.1;
    document.body.style.background =
        `radial-gradient(circle, hsl(${hue},40%,5%),black)`;

    requestAnimationFrame(colorShift);
}
colorShift();