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
