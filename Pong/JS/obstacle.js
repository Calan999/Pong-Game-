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
