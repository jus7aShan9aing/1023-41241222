const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 音效
const backgroundMusic = document.getElementById('backgroundMusic');
const hitSound = document.getElementById('hitSound');

// 球的屬性
let ballRadius = 10;
let x, y;
let dx = 2; // 水平方向速度
let dy = -2; // 垂直方向速度

// 板子的屬性
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX;

// 磚塊的屬性
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 自定義磚塊分布
const brickLayout = [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1]
];

const brickRowCount = brickLayout.length;
const brickColumnCount = brickLayout[0].length;

let bricks = [];
let score = 0; // 分數
let lives = 3; // 生命數量

// 之前球的位置信息，實現尾跡效果
let trail = [];

// 初始化遊戲
function init() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    lives = 3; // 重置生命數量
    trail = []; // 清空尾跡

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                hits: brickLayout[r][c] 
            };
        }
    }

    backgroundMusic.play(); // 開始播放背景音樂
    draw(); // 開始遊戲
}

// 返回首頁
function goHome() {
    backgroundMusic.pause(); // 停止背景音樂
    window.location.href = 'index.html'; // 返回首頁
}

// 事件監聽
document.addEventListener('mousemove', mouseMoveHandler, false);

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2; // 使板子中心跟隨滑鼠
    }
}

// 繪製磚塊
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.hits > 0) {
                b.x = c * (brickWidth + brickPadding) + brickOffsetLeft;
                b.y = r * (brickHeight + brickPadding) + brickOffsetTop;

                // 確定顏色根據擊打次數
                let color;
                if (b.hits === 3) {
                    color = 'red';
                } else if (b.hits === 2) {
                    color = 'orange';
                } else {
                    color = '#0095DD';
                }

                ctx.fillStyle = color;
                ctx.fillRect(b.x, b.y, brickWidth, brickHeight);

                // 繪製擊打次數
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(b.hits, b.x + brickWidth / 2 - 5, b.y + brickHeight / 2 + 5);
            }
        }
    }
}

// 繪製球
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// 繪製板子
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// 繪製分數和生命
function drawScoreAndLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('分數: ' + score, 8, 20);
    ctx.fillText('生命: ' + lives, canvas.width - 80, 20); // 顯示生命數量
}

// 繪製尾跡
function drawTrail() {
    ctx.save(); // 保存當前的畫布狀態
    ctx.fillStyle = 'rgba(0, 149, 221, 0.5)'; // 設定尾跡顏色和透明度
    for (let i = 0; i < trail.length; i++) {
        const trailBall = trail[i];
        ctx.beginPath();
        ctx.arc(trailBall.x, trailBall.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    ctx.restore(); // 恢復畫布狀態
}

// 碰撞檢測
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.hits > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy; // 垂直反彈
                    b.hits--; // 減少擊打次數
                    hitSound.currentTime = 0; // 重置音效時間
                    hitSound.play(); // 播放擊打音效
                    if (b.hits === 0) {
                        score++; // 增加分數
                    }
                }
            }
        }
    }
}

// 檢查遊戲是否結束
function checkGameOver() {
    let hasBricks = false;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].hits > 0) {
                hasBricks = true;
                break;
            }
        }
        if (hasBricks) break; // 如果找到磚塊，結束循環
    }
    if (!hasBricks) {
        alert('恭喜！你贏了！你的分數是: ' + score);
        backgroundMusic.pause(); // 停止背景音樂
        if (confirm('重新開始遊戲嗎？')) {
            init(); // 重新初始化遊戲
        }
    }
}

// 繪製遊戲
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawTrail(); // 繪製尾跡
    drawBall();
    drawPaddle();
    drawScoreAndLives(); // 繪製分數和生命
    collisionDetection(); // 碰撞檢測

    // 添加當前球的位置信息到尾跡
    trail.push({ x, y });

    // 限制尾跡數量
    if (trail.length > 10) {
        trail.shift(); // 移除最舊的尾跡
    }

    // 球的邏輯
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx; // 水平反彈
    }
    if (y + dy < ballRadius) {
        dy = -dy; // 垂直反彈
    } else if (y + dy > canvas.height - ballRadius) {
        // 檢查是否碰到板子
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // 垂直反彈
        } else {
            lives--; // 生命減少
            if (lives > 0) {
                resetBall(); // 重置球的位置
            } else {
                endGame(); // 遊戲結束
            }
        }
    }

    x += dx;
    y += dy;

    checkGameOver(); // 檢查遊戲是否結束

    requestAnimationFrame(draw);
}

// 重置球的位置
function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
}

// 遊戲結束
function endGame() {
    alert('遊戲結束！你的分數是: ' + score);
    backgroundMusic.pause(); // 停止背景音樂
    if (confirm('重新開始遊戲嗎？')) {
        init(); // 重新初始化遊戲
    }
}

// 初始化遊戲
init();
