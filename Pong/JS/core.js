const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const WIN_SCORE = 3;

let state = "menu";
let gameMode = "menu";

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

let ball, left, right;
let obstacles = [];

let shakeAmount = 0;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
