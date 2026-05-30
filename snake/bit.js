canvas = document.getElementById("myCanvas")
ctx = canvas.getContext("2d")
ctx.canvas.width  = window.innerWidth
ctx.canvas.height = window.innerHeight

SQUARE_SIZE = 16
R = SQUARE_SIZE/2
INITIAL_SIZE = 3
MAX_WIDTH = (canvas.width / SQUARE_SIZE) | 0
MAX_HEIGHT = (canvas.height / SQUARE_SIZE) | 0
MAP_SIZE_TEXT = "Map Size: " + MAX_WIDTH + "x" + MAX_HEIGHT
MAP_SIZE_TEXT_WIDTH = ctx.measureText(MAP_SIZE_TEXT).width
TOUCH_SENSIVITY = 7
snake = new Queue();
snakeState = "green"
direction = 'R'
lastDirection = 'R'
pause = true
fruit = new Array(2)
fruitColor = "yellow"
speed = 10
HUD_HEIGHT = 34
SNAKE_GREEN = "#22c55e"
SNAKE_HEAD = "#86efac"
SNAKE_EAT = "#facc15"
SNAKE_DEAD = "#fb7185"

prevX=0
prevY=0

field = new Array(MAX_WIDTH)
for(i = 0; i < MAX_WIDTH; i++){
    field[i] = new Array(MAX_HEIGHT)
    for(j = 0; j < MAX_HEIGHT; j++){
        field[i][j] = false
    }
}
for(i = 0; i < INITIAL_SIZE; i++){
    element = [(i+MAX_WIDTH/2)|0, (MAX_HEIGHT/2)|0]
    snake.enqueue(element)
    field[element[0]][element[1]] = true
}

function placeFruit(){
    cand = []
    do {
        cand = [(Math.random() * MAX_WIDTH) | 0, (Math.random() * MAX_HEIGHT) | 0]
    } while(field[cand[0]][cand[1]])
    fruit = cand
    fruitColor = 'hsl(' + 360 * Math.random() + ',100%,50%)';
}

placeFruit()

function play(){
    if (pause) {
        return
    }
    direction = lastDirection
    element = snake.get(snake.getLength()-1).slice()
    switch(direction){
        case 'L':
            element[0]--
            break;
        case 'U':
            element[1]--
            break;
        case 'R':
            element[0]++
            break;
        case 'D':
            element[1]++
            break;
    }
    if (element[0] == fruit [0] && element[1] == fruit[1]) {
        placeFruit()
        snakeState = 'yellow'
    } else {
        snakeState = 'green'
        tail = snake.dequeue()
        field[tail[0]][tail[1]] = false
    }
    snake.enqueue(element)
    if (element[0] < 0 || element[0] >= MAX_WIDTH || element[1] < 0 || element[1] >= MAX_HEIGHT || field[element[0]][element[1]]) {
        snakeState = 'red'
        draw()
        clearInterval(gameLoop)
        return
    }
    field[element[0]][element[1]] = true
    draw()
}

function draw(){
    drawBackground()
    drawHud()
    drawSnake()
    drawFruit()
}

function roundedRect(x, y, width, height, radius) {
    radius = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

function drawBackground() {
    background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    background.addColorStop(0, "#061512")
    background.addColorStop(0.48, "#0b1f1d")
    background.addColorStop(1, "#172617")
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.strokeStyle = "rgba(240, 253, 244, 0.055)"
    ctx.lineWidth = 1
    for(x = 0.5; x < canvas.width; x += SQUARE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, HUD_HEIGHT)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
    }
    for(y = HUD_HEIGHT + 0.5; y < canvas.height; y += SQUARE_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
    }
    ctx.restore()
}

function drawHud() {
    ctx.save()
    hud = ctx.createLinearGradient(0, 0, 0, HUD_HEIGHT)
    hud.addColorStop(0, "rgba(2, 6, 23, 0.88)")
    hud.addColorStop(1, "rgba(2, 6, 23, 0.45)")
    ctx.fillStyle = hud
    ctx.fillRect(0, 0, canvas.width, HUD_HEIGHT)

    ctx.font = "700 12px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#ecfdf5"

    scoreText = "Score " + snake.getLength()
    roundedRect(8, 7, ctx.measureText(scoreText).width + 22, 20, 999)
    ctx.fillStyle = "rgba(34, 197, 94, 0.18)"
    ctx.fill()
    ctx.fillStyle = "#ecfdf5"
    ctx.fillText(scoreText, 19, 17)

    mapTextWidth = ctx.measureText(MAP_SIZE_TEXT).width
    ctx.fillStyle = "rgba(236, 253, 245, 0.72)"
    ctx.fillText(MAP_SIZE_TEXT, canvas.width - mapTextWidth - 10, 17)

    speed_text = canvas.width < 720 ? "Speed " + speed + " | SPACE pause" : "Speed " + speed + " | +/- speed | SPACE pause | Arrows or WASD"
    speedWidth = ctx.measureText(speed_text).width
    ctx.fillText(speed_text, canvas.width/2 - speedWidth/2, 17)
    ctx.restore()
}

function drawSnake() {
    ctx.save()
    ctx.lineWidth = 1.5
    ctx.shadowColor = "rgba(34, 197, 94, 0.3)"
    ctx.shadowBlur = snakeState == 'red' ? 0 : 8
    for(i = 0; i < snake.getLength(); i++) {
        element = snake.get(i)
        isHead = i == snake.getLength() - 1
        padding = isHead ? 1 : 2
        x = element[0] * SQUARE_SIZE + padding
        y = element[1] * SQUARE_SIZE + padding
        size = SQUARE_SIZE - padding * 2
        ctx.fillStyle = snakeFill(i, isHead)
        ctx.strokeStyle = snakeState == 'red' ? "rgba(127, 29, 29, 0.8)" : "rgba(187, 247, 208, 0.45)"
        roundedRect(x, y, size, size, isHead ? 6 : 5)
        ctx.fill()
        ctx.stroke()
        if(isHead) {
            drawSnakeEyes(x, y, size)
        }
    }
    ctx.restore()
}

function snakeFill(index, isHead) {
    if(snakeState == 'red') {
        return SNAKE_DEAD
    }
    if(snakeState == 'yellow') {
        return isHead ? "#fef08a" : SNAKE_EAT
    }
    lightness = 42 + Math.min(18, index)
    return isHead ? SNAKE_HEAD : "hsl(142, 72%, " + lightness + "%)"
}

function drawSnakeEyes(x, y, size) {
    eyeOffsetX = size * 0.28
    eyeOffsetY = size * 0.3
    if(direction == 'L' || direction == 'R') {
        eyeX = direction == 'R' ? x + size * 0.68 : x + size * 0.32
        eyes = [[eyeX, y + eyeOffsetY], [eyeX, y + size - eyeOffsetY]]
    } else {
        eyeY = direction == 'D' ? y + size * 0.68 : y + size * 0.32
        eyes = [[x + eyeOffsetX, eyeY], [x + size - eyeOffsetX, eyeY]]
    }

    ctx.save()
    ctx.shadowBlur = 0
    ctx.fillStyle = snakeState == 'red' ? "#450a0a" : "#052e16"
    for(j = 0; j < eyes.length; j++) {
        ctx.beginPath()
        ctx.arc(eyes[j][0], eyes[j][1], 1.7, 0, 2 * Math.PI)
        ctx.fill()
    }
    ctx.restore()
}

function drawFruit() {
    x = fruit[0] * SQUARE_SIZE + R
    y = fruit[1] * SQUARE_SIZE + R
    ctx.save()
    ctx.shadowColor = fruitColor
    ctx.shadowBlur = 16
    fruitGradient = ctx.createRadialGradient(x - 3, y - 4, 1, x, y, R)
    fruitGradient.addColorStop(0, "#ffffff")
    fruitGradient.addColorStop(0.18, fruitColor)
    fruitGradient.addColorStop(1, "rgba(251, 113, 133, 0.95)")
    ctx.fillStyle = fruitGradient
    ctx.beginPath()
    ctx.arc(x, y, R - 1, 0, 2 * Math.PI)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
    ctx.beginPath()
    ctx.arc(x - 3, y - 4, 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
}

document.onkeydown = function(evt) {
    switch(evt.key) {
        case "ArrowLeft":
        case "a":
            if(direction != 'R') {
                lastDirection = 'L'
            }
            break;
        case "ArrowUp":
        case "w":
            if(direction != 'D') {
                lastDirection = 'U'
            }
            break;
        case "ArrowRight":
        case "d":
            if(direction != 'L') {
                lastDirection = 'R'
            }
            break;
        case "ArrowDown":
        case "s":
            if(direction != 'U') {
                lastDirection = 'D'
            }
            break;
        case " ":
            pause = !pause
            break;
        case "+":
            speed++;
            clearInterval(gameLoop)
            gameLoop = setInterval(play, 1000/speed)
            break;
        case "-":
            if(speed > 0) {
                speed--;
                clearInterval(gameLoop)
                gameLoop = setInterval(play, 1000/speed)
            }
            break;

    }
}

canvas.ontouchstart = function(evt) {
    evt.preventDefault();
    pause = false
    prevX = evt.pageX
    prevY = evt.pageY
}
canvas.ontouchend = function(evt) {
    evt.preventDefault();
    pause = true
}
canvas.ontouchmove = function(evt) {
    evt.preventDefault();
    newX = evt.touches[0].pageX
    newY = evt.touches[0].pageY
    x = newX - prevX
    y = newY - prevY
    if(Math.abs(x) > Math.abs(y)) {
        if (Math.abs(x) < TOUCH_SENSIVITY) return;
        if (x < 0 && direction != 'R') {
            lastDirection = 'L'
        } else if (direction != 'L') {
            lastDirection = 'R'
        }
    } else {
        if (Math.abs(y) < TOUCH_SENSIVITY) return;
        if (y < 0 && direction != 'D') {
            lastDirection = 'U'
        } else if (direction != 'U') {
            lastDirection = 'D'
        }
    }
    prevX = newX
    prevY = newY
}

draw()
drawStartMessage()
gameLoop = setInterval(play, 1000/speed)

function drawStartMessage() {
    panelWidth = Math.min(canvas.width - 32, 520)
    panelHeight = 132
    panelX = canvas.width/2 - panelWidth/2
    panelY = canvas.height/2 - panelHeight/2

    ctx.save()
    ctx.fillStyle = "#020617"
    roundedRect(panelX, panelY, panelWidth, panelHeight, 28)
    ctx.fill()
    ctx.strokeStyle = "rgba(187, 247, 208, 0.24)"
    ctx.stroke()

    ctx.textAlign = "center"
    ctx.fillStyle = "#ecfdf5"
    ctx.font = "700 42px Georgia, 'Times New Roman', serif"
    ctx.fillText("Snake", canvas.width/2, panelY + 52)
    ctx.font = "700 16px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    ctx.fillStyle = "#bbf7d0"
    ctx.fillText("Press SPACE or touch to start", canvas.width/2, panelY + 84)
    ctx.font = "500 12px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    ctx.fillStyle = "rgba(236, 253, 245, 0.7)"
    ctx.fillText("Arrow keys / WASD to move", canvas.width/2, panelY + 108)
    ctx.restore()
}
