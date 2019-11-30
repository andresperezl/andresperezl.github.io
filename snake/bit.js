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
snake = new Queue();
snakeState = "green"
direction = 'R'
lastDirection = 'R'
pause = true
fruit = new Array(2)
fruitColor = "yellow"
speed = 10

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
    } else {
        tail = snake.dequeue()
        field[tail[0]][tail[1]] = false
    }
    snake.enqueue(element)
    if (element[0] <= 0 || element[0] >= MAX_WIDTH || element[1] <= 0 || element[1] >= MAX_HEIGHT || field[element[0]][element[1]]) {
        snakeState = 'red'
        draw()
        clearInterval(gameLoop)
        return
    }
    field[element[0]][element[1]] = true
    draw()
}

function draw(){
    ctx.fillStyle = "black"
    ctx.fillRect(0,0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "10px sans-serif"
    ctx.fillText("Score: " + snake.getLength(), 10, 12)
    ctx.fillText(MAP_SIZE_TEXT, canvas.width - MAP_SIZE_TEXT_WIDTH - 10, 12)
    speed_text = "Speed: " + speed + " - Press \"+\" or \"-\" to increase or descrease, SPACE to Pause"
    ctx.fillText(speed_text, canvas.width/2 - ctx.measureText(speed_text).width/2, 12)
    drawSnake()
    drawFruit()
}

function drawSnake() {
    ctx.lineWidth = 1
    ctx.fillStyle = snakeState
    ctx.strokeStyle = "black"
    for(i = 0; i < snake.getLength(); i++) {
        element = snake.get(i)
        ctx.fillRect(element[0] * SQUARE_SIZE,  element[1] * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
        ctx.strokeRect(element[0] * SQUARE_SIZE,  element[1] * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
    }
}

function drawFruit() {
    x = fruit[0] * SQUARE_SIZE + R
    y = fruit[1] * SQUARE_SIZE + R
    ctx.fillStyle = fruitColor
    ctx.beginPath()
    ctx.arc(x, y, R, 0, 2 * Math.PI)
    ctx.fill()
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
draw()
ctx.fillStyle = 'white'
ctx.font = "48px san-serif"
start_text = "Press SPACE to start playing"
start_text_width = ctx.measureText(start_text).width
ctx.fillText(start_text, canvas.width/2 - start_text_width/2, canvas.height/2 - 24)
gameLoop = setInterval(play, 1000/speed)
