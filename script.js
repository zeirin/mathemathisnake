const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20; // Size of each grid square
let snake, food, dx, dy, score, isPaused;
let questionBox = document.getElementById("questionBox");
let questionText = document.getElementById("question");
let answerInput = document.getElementById("answer");
let correctAnswer = 0;
let playAgainButton = document.createElement("button");

let obstacles = [];
let obstaclesGenerated = false;

function initializeGame() {
    snake = [{ x: 10 * box, y: 10 * box }];
    food = generateFood();
    dx = box;
    dy = 0;
    score = 0;
    isPaused = false;
    obstacles = [];
    obstaclesGenerated = false;
    playAgainButton.style.display = "none";
    questionBox.style.display = "none";
    updateScore();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
        };
    } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));
    return newFood;
}

// Function to generate a vertical wall with a random length
function generateVerticalWall() {
    const xPos = Math.floor(Math.random() * (canvas.width / box)) * box; // Random X position
    const yPosStart = Math.floor(Math.random() * (canvas.height / box)); // Random start Y position
    const wallHeight = Math.floor(Math.random() * 8) + 3; // Wall length between 3 and 10 boxes

    // Generate the vertical wall
    const wall = [];
    for (let i = 0; i < wallHeight; i++) {
        const yPos = (yPosStart + i) % (canvas.height / box); // Wrap the wall if it goes beyond the canvas
        wall.push({ x: xPos, y: yPos * box });
    }
    return wall;
}

// Function to generate multiple vertical wall obstacles
function generateObstacles() {
    obstacles = [];
    let placedObstacles = 0;

    while (placedObstacles < 3) {
        const newObstacle = generateVerticalWall();

        // Check for overlap with snake or food
        const overlap = newObstacle.some(part =>
            snake.some(snakePart => snakePart.x === part.x && snakePart.y === part.y) ||
            (food.x === part.x && food.y === part.y)
        );

        // If no overlap, add to obstacles
        if (!overlap) {
            obstacles.push(newObstacle);
            placedObstacles++;
        }
    }
}

function drawGrid() {
    for (let x = 0; x < canvas.width; x += box) {
        for (let y = 0; y < canvas.height; y += box) {
            ctx.fillStyle = (x / box + y / box) % 2 === 0 ? "#f3f4f6" : "#e5e7eb";
            ctx.fillRect(x, y, box, box);
        }
    }
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = "limegreen";
    ctx.strokeStyle = "darkgreen";
    ctx.lineWidth = 2;
    snake.forEach((part, index) => {
        ctx.fillRect(part.x, part.y, box, box);
        ctx.strokeRect(part.x, part.y, box, box);
        if (index === 0) {
            ctx.fillStyle = "darkgreen";
            ctx.beginPath();
            ctx.arc(part.x + box / 2, part.y + box / 2, box / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "limegreen";
        }
    });
}

function drawFood() {
    const gradient = ctx.createRadialGradient(
        food.x + box / 2,
        food.y + box / 2,
        5,
        food.x + box / 2,
        food.y + box / 2,
        box / 2
    );
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(1, "orange");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Function to draw vertical wall obstacles
function drawObstacles() {
    ctx.fillStyle = "brown";
    obstacles.forEach(obstacle => {
        obstacle.forEach(part => {
            ctx.fillRect(part.x, part.y, box, box);
        });
    });
}

function draw() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    drawSnake();

    if (score >= 7 && !obstaclesGenerated) {
        generateObstacles();
        obstaclesGenerated = true;
    }

    if (score >= 7) {
        drawObstacles();
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        score++;
        updateScore();
        if (Math.random() < 0.3) {
            generateQuestion();
        }
    } else {
        snake.pop();
    }

    snake.unshift(head);

    if (obstacles.some(obstacle =>
        obstacle.some(part => part.x === head.x && part.y === head.y)
    )) {
        endGame();
    }

    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height ||
        snake.slice(1).some(part => part.x === head.x && part.y === head.y)
    ) {
        endGame();
    }
}

function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 + num2;
    questionText.innerText = `What is ${num1} + ${num2}?`;
    questionBox.style.display = "block";
    isPaused = true;
}

function checkAnswer() {
    if (parseInt(answerInput.value) === correctAnswer) {
        questionBox.style.display = "none";
        answerInput.value = "";
        isPaused = false;
    } else {
        endGame();
    }
}

function endGame() {
    isPaused = true;
    alert(`Game Over! Score: ${score}`);
    playAgainButton.innerText = "Play Again";
    playAgainButton.style.display = "block";
    playAgainButton.onclick = () => {
        initializeGame();
    };

    if (!document.body.contains(playAgainButton)) {
        document.body.appendChild(playAgainButton);
    }
}

function updateScore() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerText = `Score: ${score}`;
    } else {
        const newScoreElement = document.createElement("div");
        newScoreElement.id = "score";
        newScoreElement.innerText = `Score: ${score}`;
        newScoreElement.style.fontSize = "1.5rem";
        newScoreElement.style.marginTop = "10px";
        newScoreElement.style.color = "#4b5563";
        document.body.insertBefore(newScoreElement, canvas.nextSibling);
    }
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowUp" && dy === 0) { dx = 0; dy = -box; }
    else if (event.key === "ArrowDown" && dy === 0) { dx = 0; dy = box; }
    else if (event.key === "ArrowLeft" && dx === 0) { dx = -box; dy = 0; }
    else if (event.key === "ArrowRight" && dx === 0) { dx = box; dy = 0; }
});

initializeGame();
setInterval(draw, 100);
