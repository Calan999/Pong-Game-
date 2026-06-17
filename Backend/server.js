const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./leaderboard.json";

// 🔹 Helper: read DB
function readDB() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

// 🔹 Helper: write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// =====================
// GET leaderboard
// =====================
app.get("/leaderboard", (req, res) => {
    const data = readDB();

    data.sort((a, b) => b.points - a.points);

    res.json(data.slice(0, 10));
});

// =====================
// POST score
// =====================
app.post("/score", (req, res) => {
    const { name, points } = req.body;

    console.log(points)

    let data = readDB();

    let player = data.find(p => p.name === name);

    if (player) {
        player.points += points;
    } else {
        data.push({ name, points });
    }

    writeDB(data);

    res.json({ success: true });
});

// =====================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

app.post("/import", (req, res) => {

    const data = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Expected array" });
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, message: "Imported successfully" });
});
