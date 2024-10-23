const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const backgroundMusic = document.getElementById("backgroundMusic");
const hitSound = document.getElementById("hitSound");

// 球的屬性
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 0; // 初始速度為 0
let dy = 0; // 初始速度為 0
let ballLaunched = false; // 判斷球是否已經發射

// 球拍的屬性
const paddleHeight = 10;
const paddleWidth = 112.5; // 增加0.5倍，從75變為112.5
let paddleX = (canvas.width - paddleWidth) / 2;

// 磚塊的屬性
const brickRowCount = 5; // 行數設為5
const brickColumnCount = 5; // 繼續使用5列
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
function resetBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

resetBricks();

// 控制球拍
let rightPressed = false;
let leftPressed = false;

// 記分和生命
let score = 0;
let lives = 3;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("keydown", spaceKeyHandler); // 監聽空格鍵
document.addEventListener("keydown", restartGameHandler); // 監聽重新開始的鍵
restartButton.addEventListener("click", () => {
    window.location.href = "start.html"; // 返回主頁
});

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function spaceKeyHandler(e) {
    if (e.code === "Space" && !ballLaunched) {
        ballLaunched = true;
        dx = 2; // 設定球的水平速度
        dy = -2; // 設定球的垂直速度
    }
}

function restartGameHandler(e) {
    if (e.key === "r" || e.key === "R") {
        resetGame();
    }
}

function playHitSound() {
    hitSound.currentTime = 0; // 重置音效到開始位置
    hitSound.play();
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0; // 磚塊被擊中
                    score++; // 增加分數
                    if (score === brickRowCount * brickColumnCount) {
                        alert("恭喜你！你贏了！");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("分數: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("生命: " + lives, canvas.width - 65, 20);
}

function drawGameOver() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.fillText("遊戲結束！", canvas.width / 2 - 70, canvas.height / 2);
    ctx.fillText("分數: " + score, canvas.width / 2 - 50, canvas.height / 2 + 30);
    ctx.fillText("按 R 鍵重新開始", canvas.width / 2 - 80, canvas.height / 2 + 60);
    restartButton.style.display = "block"; // 顯示返回主頁按鈕
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // 更新球的坐標
    if (ballLaunched) {
        // 球的邊界檢查
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            // 當球掉落到底部，顯示遊戲結束
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--; // 失去一條生命
                if (!lives) {
                    drawGameOver(); // 顯示遊戲結束信息
                    return; // 停止遊戲
                } else {
                    // 重置球的位置
                    resetBall();
                }
            }
        }

        // 控制球拍的移動
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        // 更新球的坐標
        x += dx;
        y += dy;
    } else {
        // 如果球尚未發射，球的位置跟隨球拍
        x = paddleX + paddleWidth / 2; // 確保球在球拍中間
        y = canvas.height - paddleHeight - ballRadius; // 確保球在球拍上方
    }

    requestAnimationFrame(draw);
}

function resetBall() {
    x = paddleX + paddleWidth / 2; // 球的初始位置跟隨球拍
    y = canvas.height - paddleHeight - ballRadius; // 確保球在球拍上方
    dx = 0; // 重置球的速度
    dy = 0; // 重置球的速度
    ballLaunched = false; // 重置發射狀態
}

function resetGame() {
    score = 0;
    lives = 3;
    ballLaunched = false;
    paddleX = (canvas.width - paddleWidth) / 2; // 重置球拍位置
    resetBricks(); // 重置磚塊
    resetBall(); // 重置球位置
    //restartButton.style.display = "none"; // 隱藏返回主頁按鈕
    draw(); // 重新開始繪製
}

startGame(); // 開始遊戲時播放背景音樂
draw();
