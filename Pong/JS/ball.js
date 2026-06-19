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
