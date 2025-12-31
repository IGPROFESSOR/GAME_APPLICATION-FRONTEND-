const container = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const pauseBtn = document.getElementById('pause-btn');

const eatSound = document.getElementById('eat-sound');

const gameOverSound = document.getElementById('gameover-sound');
const homeBtn = document.getElementById('home-btn');
homeBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

const highScoreSound = new Audio("highscore.mp3");

// Unlock sounds first click
document.body.addEventListener("click", () => {
    [eatSound, gameOverSound, highScoreSound].forEach(sound => {
        sound.play().catch(()=>{});
        sound.pause();
        sound.currentTime = 0;
    });
}, { once: true });







const blockSize = 20;
let rows, cols;

let snake = [];
let food = {};
let dx = blockSize;
let dy = 0;
let score = 0;
let baseSpeed = 100; 
let speed = baseSpeed;
let gameInterval;
let isPaused = false;

//let highScore = localStorage.getItem('highScore') || 0;
//highScoreEl.textContent = highScore;
let highScore = Number(localStorage.getItem('highScore')) || 0;
highScoreEl.textContent = highScore;



// Food color options
const foodColors = ['gold', 'red', 'blue', 'green', 'orange', 'pink', 'purple', 'cyan', 'magenta', 'lime'];

function calculateGrid() {
  rows = Math.floor(window.innerHeight / blockSize);
  cols = Math.floor(window.innerWidth / blockSize);
}

function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * cols) * blockSize,
    y: Math.floor(Math.random() * rows) * blockSize
  };
}

function createFood() {
  food = getRandomPosition();
  food.color = foodColors[Math.floor(Math.random() * foodColors.length)];
}

// **Score Increment Pop-up – Center**
function showScoreIncrementCenter(){
    const msgDiv = document.createElement('div');
    msgDiv.textContent = '+1';
    msgDiv.style.position = 'fixed';
    msgDiv.style.left = '50%';
    msgDiv.style.top = '50%';
    msgDiv.style.transform = 'translate(-50%, -50%)';
    msgDiv.style.fontSize = '36px';
    msgDiv.style.color = '#00FF00';  // green
    msgDiv.style.fontWeight = 'bold';
    msgDiv.style.fontFamily = '"Arial", sans-serif';
    msgDiv.style.textShadow = '0 0 8px #00FF00';
    msgDiv.style.opacity = '1';
    msgDiv.style.transition = 'all 1s ease-out';
    document.body.appendChild(msgDiv);

    // Float up and fade
    setTimeout(() => {
        msgDiv.style.top = '45%';
        msgDiv.style.opacity = '0';
    }, 10);

    setTimeout(() => {
        document.body.removeChild(msgDiv);
    }, 1000); // 1 sec visible
}

function drawSnake() {
  container.innerHTML = '';

  snake.forEach((segment, index) => {
    const div = document.createElement('div');
    div.classList.add('snake');
    div.style.left = segment.x + 'px';
    div.style.top = segment.y + 'px';

    if(index === 0){
        div.classList.add('head'); 
        div.style.backgroundColor = 'silver';
    } else {
        let brightness = 50 + index*1.2;
        if(brightness > 80) brightness = 80;
        div.style.backgroundColor = `hsl(0, 0%, ${brightness}%)`;
    }

    container.appendChild(div);
  });

  // Draw food
  const foodDiv = document.createElement('div');
  foodDiv.classList.add('food');
  foodDiv.style.left = food.x + 'px';
  foodDiv.style.top = food.y + 'px';
  foodDiv.style.backgroundColor = food.color;
  foodDiv.style.boxShadow = `0 0 12px 6px ${food.color}`;
  container.appendChild(foodDiv);
}

function moveSnake() {
  if(isPaused) return;

  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score++;
    scoreEl.textContent = score;

    eatSound.currentTime = 0;
    eatSound.play();

    showScoreIncrementCenter(); // 👈 +1 popup

    createFood();

    if(score > highScore){
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreEl.textContent = highScore;

        highScoreSound.currentTime = 0;
        highScoreSound.play();
    }

    clearInterval(gameInterval);
    speed = Math.max(50, baseSpeed - score * 1.5);
    gameInterval = setInterval(moveSnake, speed);
}

 else {
    snake.pop();
  }

  if(head.x < 0 || head.x >= window.innerWidth || head.y < 0 || head.y >= window.innerHeight || collision(head)){
    gameOver();
    return;
  }

  drawSnake();
}

function collision(head){
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

document.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowUp' && dy === 0){ dx=0; dy=-blockSize; }
  if(e.key === 'ArrowDown' && dy === 0){ dx=0; dy=blockSize; }
  if(e.key === 'ArrowLeft' && dx === 0){ dx=-blockSize; dy=0; }
  if(e.key === 'ArrowRight' && dx === 0){ dx=blockSize; dy=0; }
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
});

function startGame(){
  calculateGrid();
  snake = [{x:0, y:0}];
  dx = blockSize;
  dy = 0;
  score = 0;
  speed = baseSpeed;
  scoreEl.textContent = score;
  gameOverEl.style.display = 'none';
  createFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(moveSnake, speed);
}


function gameOver(){
  finalScoreEl.textContent = score;
  gameOverEl.style.display = 'flex';
  clearInterval(gameInterval);
  gameOverSound.play();
}
let currentScroll = window.pageYOffset;
let isScrolling = false;

window.addEventListener("wheel", (e) => {
    e.preventDefault();

    currentScroll += e.deltaY * 0.3; // 👈 scroll speed control
    currentScroll = Math.max(
        0,
        Math.min(currentScroll, document.body.scrollHeight - window.innerHeight)
    );

    if (!isScrolling) {
        isScrolling = true;
        smoothScroll();
    }
}, { passive: false });

function smoothScroll() {
    const diff = currentScroll - window.pageYOffset;
    window.scrollBy(0, diff * 0.1);

    if (Math.abs(diff) > 0.5) {
        requestAnimationFrame(smoothScroll);
    } else {
        isScrolling = false;
    }
}



window.addEventListener('resize', calculateGrid);

startGame();
