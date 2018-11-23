// Set up
const $canvas = document.querySelector('.js-canvas')
const context = $canvas.getContext('2d')

// Resize
const sizes = { width: 800, height: 600 }
const resize = () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    $canvas.width = sizes.width
    $canvas.height = sizes.height
}
window.addEventListener('resize', resize)
resize()

// Cursor positon
const cursor = 
{
    x: -50, 
    y: -50
}
window.addEventListener('mousemove', (_event) =>
{
    cursor.x = _event.clientX
    cursor.y = _event.clientY
})

// Variable init
let gameMenuOn = true
let gameStarted = false
deathScreenOn = false
let bullets = new Array()
let asteroids = new Array()
let lives = new Array()
let asteroidPush = 60
let scoreCounterTemp = 0
let scoreDisplay = 0
asteroidPushNumber = 60
const gradient = context.createLinearGradient(0,0,0, sizes.height)
gradient.addColorStop(0,`hsl(${Math.random() * 360}, 100%, 50%)`)
gradient.addColorStop(1,`hsl(${Math.random() * 360}, 100%, 50%)`)

//OBJ Player
class Player
{
    constructor( _size, _posX, _posY, _speed)
    {
        this.size = _size
        this.posX = _posX
        this.posY = _posY
        this.speed = _speed
        this.life = 3
        this.color =  `hsla(${Math.random() * 360}, 100%, 50%)`
        this.dead = false
    }
    updatePosition(cursorX, cursorY)
    {
        this.posX = cursorX
        this.posY = cursorY
    }
    drawPlayer(cursorX, cursorY)
    {
        context.save()
        context.fillStyle=this.color
        this.updatePosition(cursorX, cursorY)
        context.fillRect(this.posX-25, this.posY-25, this.size, this.size)
        context.restore()
    }
}
const playerShip = new Player (50, cursor.x, cursor.y, 20) 

//OBJ Bullet
class Bullet
{
    constructor(_height, _width, _posX, _posY, _speed)
    {
        this.height = _height
        this.width = _width
        this.heightDistortion = 1.07
        this.widthDistortion = 0.98
        this.posX = _posX
        this.posY = _posY
        this.speed = _speed
        this.friction = 1.05
        this.color =  `hsla(${Math.random() * 360}, 100%, 50%)`
    }
    drawBullet(cursorX, cursorY)
    {
        context.save()
        context.fillStyle=this.color
        this.height*= this.heightDistortion
        this.width*= this.widthDistortion
        this.speed *= this.friction
        context.fillRect(this.posX-8, (this.posY-=this.speed)-50, this.width, this.height)
        context.restore()
    }
}
window.addEventListener('mousedown', () =>
{
    if(gameStarted)
    {
        bullets.push(new Bullet(50, 15, cursor.x, cursor.y, 40))
    }
})

//Obj Asteroid
class Asteroid
{
    constructor(_size, _posX, _posY, _speed, _friction)
    {
        this.size = _size
        this.posX = _posX
        this.posY = _posY
        this.speed = _speed
        this.friction = _friction
        this.color =  `hsla(${Math.random() * 360}, 100%, 50%)`
        this.frameCount = 0 
        this.randomMovement = this.randomMovementGenerator()

    }
    randomMovementGenerator()
    {
        let randomMovement = Math.random() * (1.005 - 0.995) + 0.995
        return (randomMovement < 1.002 || randomMovement > 0.998) ? Math.random() * (1.005 - 0.995) + 0.995 : randomMovement        
    }
    drawAsteroid()
    {
        context.save()
        context.fillStyle=this.color
        this.speed *= this.friction
        if(this.frameCount===50)
        {
            this.randomMovement = this.randomMovementGenerator()
            this.frameCount=0
        }
        if(this.posX+this.size > sizes.width)
        {
            this.randomMovement=0.995
        }
        else if((this.posX) < 0)
        {
            this.randomMovement*=1
        }
        context.fillRect(this.posX*=this.randomMovement, this.posY+=this.speed, this.size, this.size)
        context.restore()
        this.frameCount++
    }
}

//Live
function drawLives(length){
    context.save()
    context.fillStyle = 'red'
    //context.arc((sizes.width*0.85)+ 80 * length , 50, 25, 0, 2*Math.PI)
    context.font = '30px "Press Start 2P"'
    context.fillText("O", (sizes.width*0.85)+ 80 * length, 50)
    context.restore()  
}

//Loop
const loop = () =>
{
    window.requestAnimationFrame(loop)  
    context.save()
    context.fillStyle = gradient;
    context.fillRect(0, 0, sizes.width, sizes.height)
    context.restore()
    if(gameMenuOn)
    {
        const startText = "Play"
        if(cursor.x > ($canvas.width/2)-(context.measureText(startText).width/2) && (cursor.x < $canvas.width - ($canvas.width/2) + context.measureText(startText).width/2) && (cursor.y < ($canvas.height/2) && (cursor.y > $canvas.height/2 - 50)))
        {
            context.font = `60px "Press Start 2P"`
            context.fillStyle = 'red'
        }
        else{
            context.font = `50px "Press Start 2P"`
            context.fillStyle = 'black'
        }
        context.fillText(startText, ($canvas.width/2)-(context.measureText(startText).width/2), ($canvas.height/2))
        window.addEventListener('click', () =>
        {
            if(cursor.x > ($canvas.width/2)-(context.measureText(startText).width/2) && (cursor.x < $canvas.width - ($canvas.width/2) + context.measureText(startText).width/2) && (cursor.y < ($canvas.height/2) && (cursor.y > $canvas.height/2 - 50)))
            {
                gameMenuOn=false
                gameStarted=true
            }
        })
    }
    if(deathScreenOn)
    {
        const deathText = "You died"
        context.font = `50px "Press Start 2P"`
        context.fillStyle = 'black'
        context.fillText(deathText, ($canvas.width/2)-(context.measureText(deathText).width/2), ($canvas.height/2))
    }
    playerShip.drawPlayer(cursor.x, cursor.y)
    if(gameStarted==true){
        for(let life = 0; life < playerShip.life; life++){
            drawLives(life) 
        }
        for(let i=0; i<bullets.length; i++){
            if(bullets[i].posY<0)
            {
                bullets.splice(bullets, 1)
            }
            for(let j=0; j<asteroids.length; j++)
            {
                if(bullets.length>0 && asteroids[j].posY > bullets[i].posY)
                {
                    if(bullets[i].posX > asteroids[j].posX && bullets[i].posX < (asteroids[j].posX+asteroids[j].size) || (bullets[i]+ bullets[i].width) > asteroids[j].posX && (bullets[i]+ bullets[i].width) < (asteroids[j].posX+asteroids[j].width))
                    {
                        if(asteroids[j].size>50)
                        {
                            asteroids[j].size/=1.5
                            asteroids[j].posX=asteroids[j].posX+(asteroids[j].size/5)
                        }
                        else
                        {
                            asteroids.splice(j, 1)
                            bullets.splice(i, 1)
                            scoreCounterTemp++
                        }
                    }
                }
            }
            if(bullets.length>0)
            {
                bullets[i].drawBullet()
            }
        }
        if(asteroidPush>=asteroidPushNumber){
            asteroids.push(new Asteroid((Math.floor(Math.random() * (70 - 35)) + 35), Math.random()*sizes.width, 0, 3, 1.008))
            for(let i=0; i<asteroids.length; i++){
                asteroids[i].drawAsteroid()
            }
            asteroidPush=0
            if(asteroidPushNumber<3)
            {
                asteroidPushNumber=3
            }
            else
            {
                asteroidPushNumber*=0.95
            }
        }
        else
        {
            asteroidPush++
        }
        for(let i=0; i<asteroids.length; i++){
            asteroids[i].drawAsteroid()
            if(asteroids[i].posY>sizes.width)
            {
                asteroids.splice(asteroids, 1)
            }
        }
        for(let k=0; k<asteroids.length; k++)
            {
                if(asteroids[k].posY < playerShip.posY && (asteroids[k].posY + asteroids[k].size) > playerShip.posY)
                {
                    if(playerShip.posX > asteroids[k].posX && playerShip.posX < (asteroids[k].posX+asteroids[k].size) || (playerShip+playerShip.size) > asteroids[k].posX && (playerShip+ playerShip.size) < (asteroids[k].posX+asteroids[k].width))
                    {
                        if (playerShip.life > 0){
                            asteroids.splice(k, 1)
                            playerShip.life-- 
                        }
                        if(playerShip.life <1)
                        {
                            deathScreenOn=true
                            gameStarted=false

                        }
                    }
                }
            }
    
        // Display score
        context.font = '30px "Press Start 2P"'
        if(scoreCounterTemp != scoreDisplay ){
            scoreDisplay = scoreCounterTemp
            context.font = `32px "Press Start 2P"`
            context.fillStyle = 'red'
        }
        else{
            context.fillStyle = 'black'
        }
        context.fillText(`SCORE : ${scoreDisplay}`,10,50)
    }
}

loop()
