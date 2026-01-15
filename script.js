const playground = document.querySelector(".playground");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const hudTimer = document.getElementById("hudTimer");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");
const bgMusic = document.getElementById("bgMusic");
const soundBtn = document.getElementById("soundToggle");

let soundOn = true;
let keys = {};
let running = false;
let paused = false;
let score = 0;
let startTime = null;
let hue = 0;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

pauseBtn.onclick = () => {
    if (!running) return;
    paused = true;
    pauseScreen.classList.remove("hidden");
    bgMusic.pause();
};

resumeBtn.onclick = () => {
    paused = false;
    pauseScreen.classList.add("hidden");
    if (soundOn) bgMusic.play();
};

quitBtn.onclick = () => {
    if (!running) return;
    paused = true;
    quitScreen.classList.remove("hidden");
};

quitNo.onclick = () => {
    paused = false;
    quitScreen.classList.add("hidden");
};

quitYes.onclick = () => endGame();

startBtn.onclick = () => {
    if (soundOn) {
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
    running = true;
    paused = false;
    score = 0;
    scoreEl.textContent = 0;
    startTime = Date.now();
    startScreen.classList.add("hidden");
    spawnFood();
    requestAnimationFrame(gameLoop);
    requestAnimationFrame(updateTimer);
};

soundBtn.onclick = () => {
    soundOn = !soundOn;

    if (soundOn) {
        soundBtn.textContent = "🔊";
        if (running && !paused) bgMusic.play();
    } else {
        soundBtn.textContent = "🔇";
        bgMusic.pause();
    }
};

function updateTimer() {
    if (!running || paused) return;
    const s = Math.floor((Date.now() - startTime) / 1000);
    hudTimer.textContent =
        String(Math.floor(s / 60)).padStart(2, "0") + ":" +
        String(s % 60).padStart(2, "0");
    requestAnimationFrame(updateTimer);
}

function createFood() {
    const f = document.createElement("div");
    const size = 12 + Math.random() * 35;

    f.style.width = f.style.height = size + "px";
    f.style.left = Math.random() * (playground.clientWidth - size) + "px";
    f.style.top = Math.random() * (playground.clientHeight - size) + "px";

    const speed = 0.6 + Math.random() * 0.6;
    let vx = (Math.random() < 0.5 ? -1 : 1) * speed;
    let vy = (Math.random() < 0.5 ? -1 : 1) * speed;

    f.vx = vx;
    f.vy = vy;

    f.className = "food";
    playground.appendChild(f);
}

function spawnFood() {
    for (let i = 0; i < 10; i++) createFood();
}

function gameLoop() {
    if (!running) return;
    if (!paused) {
        movePlayer();
        moveFood();
        checkCollision();
    }
    requestAnimationFrame(gameLoop);
}

function moveFood() {
    document.querySelectorAll(".food").forEach(f => {
        let x = f.offsetLeft + f.vx;
        let y = f.offsetTop + f.vy;

        if (x <= 0 || x + f.clientWidth >= playground.clientWidth) f.vx *= -1;
        if (y <= 0 || y + f.clientHeight >= playground.clientHeight) f.vy *= -1;

        f.style.left = Math.max(0, Math.min(x, playground.clientWidth - f.clientWidth)) + "px";
        f.style.top = Math.max(0, Math.min(y, playground.clientHeight - f.clientHeight)) + "px";
    });
}

function movePlayer() {
    let x = player.offsetLeft;
    let y = player.offsetTop;
    const step = 3;

    if (keys.ArrowUp) y -= step;
    if (keys.ArrowDown) y += step;
    if (keys.ArrowLeft) x -= step;
    if (keys.ArrowRight) x += step;

    player.style.left = Math.max(0, Math.min(x, playground.clientWidth - player.clientWidth)) + "px";
    player.style.top = Math.max(0, Math.min(y, playground.clientHeight - player.clientHeight)) + "px";
}

playground.addEventListener("touchmove", e => {
    if (!running || paused) return;
    const rect = playground.getBoundingClientRect();
    const touch = e.touches[0];

    let x = touch.clientX - rect.left - player.clientWidth / 2;
    let y = touch.clientY - rect.top - player.clientHeight / 2;

    player.style.left = Math.max(0, Math.min(x, playground.clientWidth - player.clientWidth)) + "px";
    player.style.top = Math.max(0, Math.min(y, playground.clientHeight - player.clientHeight)) + "px";
});

function checkCollision() {
    document.querySelectorAll(".food").forEach(f => {
        const fr = f.getBoundingClientRect();
        const pr = player.getBoundingClientRect();

        if (pr.left < fr.right && pr.right > fr.left &&
            pr.top < fr.bottom && pr.bottom > fr.top) {

            if (f.clientWidth > player.clientWidth) {
                endGame();
            } else {
                score += 10;
                scoreEl.textContent = score;
                growPlayer();
                f.remove();
                createFood();
            }
        }
    });
}

function growPlayer() {
    player.style.width = player.clientWidth + 1 + "px";
    player.style.height = player.clientHeight + 1 + "px";
    hue = (hue + 35) % 360;
    player.style.background = `hsl(${hue},80%,60%)`;
}

function endGame() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    running = false;
    finalTime.textContent = "Preživio si: " + hudTimer.textContent;
    finalScore.textContent = "Score: " + score;
    gameOver.classList.remove("hidden");
}
