const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let spriteSheet = new Image();
spriteSheet.src = 'sprites.png'; 
//received from: 
//https://source.chromium.org/chromium/chromium/src/+/main:components/neterror/resources/images/default_100_percent/offline/100-offline-sprite.png

let isLoopRunning = false;

let initialSpeed = 1;
let gameSpeed = initialSpeed;

spriteSheet.onload = function () {
    if (!isLoopRunning) {
        isLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
};

let trex = {
    x: 50,
    y: 260,
    width: 44,
    height: 47,
    velocityY: 0,
    gravity: 0.3,
    isJumping: false,
    isDucking: false,
    frame: 0,
};

let cactus = {
    x: canvas.width,
    y: 260,
    width: 15,
    height: 33,
};

let bigCactus = {
    x: canvas.width,
    y: 260,
    width: 51,
    height: 47,
};

let bird = {
    x: canvas.width,
    y: 230,
    width: 48,
    height: 37,
    frame: 0,
};

let obstacles = [];
let score = 0;
let frameCount = 0;
let isGameOver = false;
let gameStarted = false;

document.addEventListener('keydown', function (event) {
    if ((event.key === ' ' || event.key === 'ArrowUp') && !trex.isJumping && !isGameOver && gameStarted) {
        jump();
    }

    if (event.key === 'ArrowDown' && !trex.isDucking && !isGameOver && gameStarted) {
        duck();
    }
    if (event.key === ' ' && !gameStarted) {
        gameStarted = true;
        frameCount = 0;
        score = 0;
        obstacles = [];
        isGameOver = false;
        gameSpeed = initialSpeed;
        if (!isLoopRunning) {
            isLoopRunning = true;
            requestAnimationFrame(gameLoop);
        }
    }
   // Restart the game if Space is pressed after game over
   if (event.code === 'Space' && isGameOver) {
    gameStarted = true;
    frameCount = 0;
    score = 0; // Reset score
    obstacles = []; // Clear existing obstacles
    isGameOver = false; // Reset game over state
    gameSpeed = initialSpeed;
    trex = {
        x: 50,
        y: 260,
        width: 44,
        height: 47,
        velocityY: 0,
        gravity: 0.9,
        isJumping: false,
        isDucking: false,
        frame: 0,
    }; // Reset T-Rex to initial state
    if (!isLoopRunning) {
        isLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
}
});

document.addEventListener('keyup', function (event) {
    // Stop ducking when the Down Arrow key is released
    if (event.key === 'ArrowDown') {
        trex.isDucking = false;
    }
});

document.addEventListener('touchstart', function () {
    if (!trex.isJumping && !isGameOver && gameStarted) {
        jump();
    }
});

function jump() {
    trex.isJumping = true;
    trex.velocityY = -15; 
}

function duck() {
    trex.isDucking = true;
}

function update() {
    console.log(frameCount);
    if (isGameOver) return;

    if (frameCount % 60 === 0) {
        gameSpeed += 0.1;
    }

    // T-Rex position and velocity updates
    trex.velocityY += trex.gravity;
    trex.y += trex.velocityY;

    if (trex.y >= 260) {
        trex.y = 260;
        trex.isJumping = false;
        trex.velocityY = 0;
    }

    // Adjust T-Rex height and position during ducking
    if (trex.isDucking) {
        trex.height = 25;
        trex.y += 22;  // Lower the T-Rex position during ducking
    } else if (!trex.isDucking && !trex.isJumping) {
        trex.height = 47;
        trex.y = 260;
    }

    // Bird animation frames update
    bird.frame = frameCount % 20 === 0 ? (bird.frame === 0 ? 1 : 0) : bird.frame;
    trex.frame = frameCount % 10 === 0 ? (trex.frame === 0 ? 1 : 0) : trex.frame;

    // Spawn obstacles only if the game has started
    if (gameStarted && frameCount % 150 === 0) {
        const obstacleType = ["bird", "cactus", "bigCactus"][Math.floor(Math.random() * 3)];
        let obstacle = {
            x: canvas.width,
            y: obstacleType === 'bird' ? (bird.y || cactus.y): obstacleType === 'bigCactus' ? bigCactus.y : cactus.y,
            width: obstacleType === 'bird' ? bird.width : obstacleType === 'bigCactus' ? bigCactus.width : cactus.width,
            height: obstacleType === 'bird' ? bird.height : obstacleType === 'bigCactus' ? bigCactus.height : cactus.height,
            type: obstacleType
        };
        obstacles.push(obstacle);
    }

    // Update obstacles and check for collisions
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Check for collision with the T-Rex
        if (
            trex.x < obstacle.x + obstacle.width &&
            trex.x + trex.width > obstacle.x &&
            trex.y < obstacle.y + obstacle.height &&
            trex.y + trex.height > obstacle.y
        ) {
            isGameOver = true;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);  
    // Draw T-Rex based on its current state
    let trexFrameX;
    if (trex.isDucking) {
        trex.frame === 0 ? trexFrameX = 1113 : trexFrameX = 1173;
        ctx.drawImage(spriteSheet, trexFrameX, 22, 58, 25, trex.x, trex.y, trex.width, trex.height);
    } else {
        trex.frame === 0 ? trexFrameX = 936 : trexFrameX = 980;
        ctx.drawImage(spriteSheet, trexFrameX, 2, 44, 47, trex.x, trex.y, trex.width, trex.height);
    }

    // Draw obstacles (cactus or bird)
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'cactus') {
            ctx.drawImage(spriteSheet, 229, 3, 15, 33, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'bird') {
            let birdFrameX = bird.frame === 0 ? 134 : 180; // Bird animation frames
            ctx.drawImage(spriteSheet, birdFrameX, 3, 48, 37, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'bigCactus') {
            ctx.drawImage(spriteSheet, 229, 3, 51, 47, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });

    // Draw game over text
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    if (gameStarted) {
        frameCount++;
    }
    update();
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        isLoopRunning = false;
        frameCount = 0;
    }
}
