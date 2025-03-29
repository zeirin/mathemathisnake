const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const snakeTexture = new Image();
snakeTexture.src = "images/snakescales.png";

const gridSize = 20;
let snake = [{ x: 240, y: 240 }, { x: 220, y: 240 }];
let food = { x: 0, y: 0 };
let direction = "right";
let nextDirection = "right";
let score = 0;
let gameRunning = true;
let interval;
let mouthOpen = false;
let countdownInterval;

const statisticsQuestions = [
    { question: "What is the mean of 10, 20, and 30?", answer: "1" },
    { question: "What is the median of 5, 15, and 25?", answer: "1" },
    { question: "What is the mode of 2, 3, 3, 5, 7?", answer: "1" },
    { question: "What is the range of 8, 14, 22, 30?", answer: "1" },
    { question: "If the mean of 4 numbers is 12, what is the sum of the numbers?", answer: "1" }
];

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

function checkMathQuestion() {
    if (Math.random() < 0.5) {
        const randomQuestion = statisticsQuestions[Math.floor(Math.random() * statisticsQuestions.length)];
        const userAnswer = prompt(randomQuestion.question);
        if (userAnswer === null || userAnswer.trim() !== randomQuestion.answer) {
            gameOver();
        }
    }
}

function startCountdown(durationInSeconds, displayElementId) {
    const timerElement = document.getElementById(displayElementId);
    let remainingTime = durationInSeconds;

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            gameOver();
        }

        remainingTime--;
    }, 1000);
}

function update() {
    if (!gameRunning) return;
    
    direction = nextDirection;
    let newHead = { ...snake[0] };

    switch (direction) {
        case "right": newHead.x += gridSize; break;
        case "left": newHead.x -= gridSize; break;
        case "up": newHead.y -= gridSize; break;
        case "down": newHead.y += gridSize; break;
    }

    if (newHead.x >= canvas.width || newHead.x < 0 || newHead.y >= canvas.height || newHead.y < 0 ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        mouthOpen = true;
        setTimeout(() => {
            mouthOpen = false;
        }, 100);
        checkMathQuestion();
        generateFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(interval);
    clearInterval(countdownInterval);
    finalScore.innerText = `Game Over! Score: ${score}`;
    gameOverScreen.style.display = "block";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //game border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    //rounded rectangles(snake body)
    function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

    //snake body
    for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];

    ctx.save();
    drawRoundedRect(segment.x, segment.y, gridSize, gridSize, gridSize / 3);
    ctx.clip(); 

    ctx.drawImage(snakeTexture, segment.x, segment.y, gridSize, gridSize);

    ctx.restore();
}


    //snake head(eyes and mouth)
    const head = snake[0];
    ctx.fillStyle = "white";
    ctx.beginPath();

    //Eye positions
    let eyeOffsetX = 0, eyeOffsetY = 0;
    switch (direction) {
        case "right": eyeOffsetX = gridSize / 6; break;
        case "left": eyeOffsetX = -gridSize / 6; break;
        case "up": eyeOffsetY = -gridSize / 6; break;
        case "down": eyeOffsetY = gridSize / 6; break;
    }

    //eyes
    ctx.arc(head.x + gridSize / 3 + eyeOffsetX, head.y + gridSize / 3 + eyeOffsetY, gridSize / 6, 0, Math.PI * 2);
    ctx.arc(head.x + (2 * gridSize) / 3 + eyeOffsetX, head.y + gridSize / 3 + eyeOffsetY, gridSize / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();

    //pupils
    ctx.arc(head.x + gridSize / 3 + eyeOffsetX * 1.5, head.y + gridSize / 3 + eyeOffsetY * 1.5, gridSize / 12, 0, Math.PI * 2);
    ctx.arc(head.x + (2 * gridSize) / 3 + eyeOffsetX * 1.5, head.y + gridSize / 3 + eyeOffsetY * 1.5, gridSize / 12, 0, Math.PI * 2);
    ctx.fill();

    //mouth
    if (mouthOpen) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(head.x + gridSize / 2, head.y + gridSize / 1.5, gridSize / 4, 0, Math.PI);
        ctx.fill();
    }

    //food
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    //score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];

        if (i === 0 || i === snake.length - 1) {
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
        } else {
            ctx.lineJoin = "miter";
            ctx.lineCap = "butt";
        }

        ctx.drawImage(snakeTexture, segment.x, segment.y, gridSize, gridSize);
    }
}



window.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if ((e.key === "ArrowRight" || e.key === "d") && direction !== "left") nextDirection = "right";
    if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "right") nextDirection = "left";
    if ((e.key === "ArrowUp" || e.key === "w") && direction !== "down") nextDirection = "up";
    if ((e.key === "ArrowDown" || e.key === "s") && direction !== "up") nextDirection = "down";
});

function startGameLoop() {
    clearInterval(interval);
    gameRunning = true;
    interval = setInterval(() => {
        update();
        draw();
    }, 100);
}

snakeTexture.onload = () => {
startCountdown(119, "countdown-timer");
generateFood();
startGameLoop();
};

function resetGame() {
    snake = [{ x: 240, y: 240 }, { x: 220, y: 240 }];
    direction = "right";
    nextDirection = "right";
    score = 0;
    gameRunning = true;
    gameOverScreen.style.display = "none";
    generateFood();
    startCountdown(119, "countdown-timer");
    startGameLoop();
}
