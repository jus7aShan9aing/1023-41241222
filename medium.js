const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 音效
const backgroundMusic = document.getElementById('backgroundMusic');
const hitSound = document.getElementById('hitSound');
const powerUpSound = document.getElementById('powerUpSound'); // 升級音效

// 球的屬性
let ballRadius = 10;
let x, y;
let dx = 2;
let dy = -2;

// 板子的屬性
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX;

// 磚塊的屬性
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 自定義磚塊分布
const brickLayout = [
    [1, 1, 1, 0, 2],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 3],
    [0, 0, 1, 0, 0],
    [1, 0, 0, 1, 1]
];

canvas.addEventListener('mousemove', function(event) {
    const relativeX = event.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2; // 控制擋板位置
    }
});

const brickRowCount = brickLayout.length;
const brickColumnCount = brickLayout[0].length;

let bricks = [];
let score = 0; // 分數
let lives = 3; // 生命數量

// 升級道具
let powerUps = [];
const powerUpTypes = ['expand', 'shrink'];
const powerUpDuration = 5000; // 升級持續時間

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
    lives = 3;
    trail = [];
    powerUps = []; // 清空升級道具

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

    backgroundMusic.play();
    draw();
}

// 返回首頁
function goHome() {
    backgroundMusic.pause();
    window.location.href = 'index.html';
}

// 事件監聽
document.addEventListener('mousemove', mouseMoveHandler, false);

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// 隨機生成道具
function generatePowerUp(x, y) {
    const types = ['expand', 'shrink', 'blue']; // 定義道具類型
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({ x: x, y: y, type: type }); // 添加道具到陣列
}

// 繪製磚塊
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.hits > 0) {
                b.x = c * (brickWidth + brickPadding) + brickOffsetLeft;
                b.y = r * (brickHeight + brickPadding) + brickOffsetTop;

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

                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(b.hits, b.x + brickWidth / 2 - 5, b.y + brickHeight / 2 + 5);
            }
        }
    }
}

// 繪製道具
function drawPowerUps() {
    for (const powerUp of powerUps) {
        ctx.fillStyle = powerUp.type === 'expand' ? 'green' : powerUp.type === 'shrink' ? 'red' : 'blue';
        ctx.fillRect(powerUp.x, powerUp.y, 10, 10); // 繪製道具
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
    ctx.fillText('生命: ' + lives, canvas.width - 80, 20);
}

// 繪製尾跡
function drawTrail() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 149, 221, 0.5)';
    for (let i = 0; i < trail.length; i++) {
        const trailBall = trail[i];
        ctx.beginPath();
        ctx.arc(trailBall.x, trailBall.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    ctx.restore();
}

// 碰撞檢測
function collisionDetection() {
    for (let i = bricks.length - 1; i >= 0; i--) {
        const brick = bricks[i];

        // 碰撞檢測邏輯
        if (x + radius > brick.x && x - radius < brick.x + brick.width &&
            y + radius > brick.y && y - radius < brick.y + brick.height) {
            
            // 碰撞後生成道具
            generatePowerUp(brick.x + brick.width / 2, brick.y); // 在磚塊中心生成道具
            
            // 反彈球的方向
            if (y < brick.y || y > brick.y + brick.height) {
                dy = -dy; // 垂直碰撞
            } else {
                dx = -dx; // 水平碰撞
            }

            bricks.splice(i, 1); // 移除磚塊
            score += 10; // 增加分數
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
        if (hasBricks) break;
    }
    if (!hasBricks) {
        alert('恭喜！你贏了！你的分數是: ' + score);
        backgroundMusic.pause();
        if (confirm('重新開始遊戲嗎？')) {
            init();
        }
    }
}

// 碰撞檢測道具
function collisionPowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        // 檢查道具是否掉出畫布
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1); // 移除掉落到畫布底部的道具
        } else if (
            powerUp.y + 10 >= canvas.height - paddleHeight &&
            powerUp.x > paddleX &&
            powerUp.x < paddleX + paddleWidth
        ) {
            // 碰到板子
            powerUpSound.play(); // 播放升級音效
            activatePowerUp(powerUp.type); // 啟用升級
            powerUps.splice(i, 1); // 移除道具
        }
        powerUp.y += 2; // 使道具向下掉落
    }
}

// 啟用升級
function activatePowerUp(type) {
    if (type === 'expand') {
        paddleWidth += 20; // 擴大擋板
    } else if (type === 'shrink') {
        paddleWidth = Math.max(30, paddleWidth - 20); // 縮小擋板，最小 30 像素
    } else if (type === 'blue') {
        paddleWidth = Math.max(30, paddleWidth - 20); // 減少擋板寬度
        paddleHeight += 10; // 增加擋板高度
    }

    // 限時效果（如果需要）
    setTimeout(() => {
        if (type === 'expand') {
            paddleWidth = Math.max(75, paddleWidth - 20); // 回復原來大小
        } else if (type === 'shrink') {
            paddleWidth += 20; // 回復原來大小
        } else if (type === 'blue') {
            paddleWidth += 20; // 回復擋板寬度
            paddleHeight = Math.max(20, paddleHeight - 10); // 回復擋板高度
        }
    }, powerUpDuration);
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += 2; // 道具向下掉落

        // 如果道具掉出畫布，則移除
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function updateBallPosition() {
    x += dx;
    y += dy;

    // 碰撞邊界檢測
    if (x + radius > canvas.width || x - radius < 0) {
        dx = -dx; // 水平反彈
    }
    if (y - radius < 0) {
        dy = -dy; // 垂直反彈
    } else if (y + radius > canvas.height) {
        // 掉出界面時的處理
        lives--;
        resetBall(); // 重置球的位置
    }
}


// 繪製遊戲
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPowerUps(); // 繪製道具
    drawBall();
    drawPaddle();
    drawScoreAndLives();
    collisionDetection(); // 檢查碰撞
    // 更新物件位置
    updateBallPosition();
    updatePowerUps(); // 如果有道具，更新它們的位置

    // 包裝在 try...catch 中
    try {
        collisionPowerUps(); // 檢查道具碰撞
    } catch (error) {
        console.error('碰撞檢測出現錯誤:', error);
    }

    trail.push({ x, y });

    if (trail.length > 10) {
        trail.shift();
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (lives > 0) {
                resetBall();
            } else {
                endGame();
            }
        }
    }

    x += dx;
    y += dy;

    checkGameOver();

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
    backgroundMusic.pause();
    if (confirm('重新開始遊戲嗎？')) {
        init();
    }
}

// 初始化遊戲
init();
