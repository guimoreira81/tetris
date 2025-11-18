class Vector2{
    constructor(x=0, y=0){
        this.x = x
        this.y = y
    }
    text(){
        return `(${this.x}, ${this.y})`
    }
    rText(precision=10){
        return `(${Math.round(this.x*precision)/precision}, ${Math.round(this.y*precision)/precision})`
    }
    add(other){
        return new Vector2(this.x+other.x, this.y+other.y)
    }
    sub(other){
        return new Vector2(this.x-other.x, this.y-other.y)
    }
    mul(other){
        if (typeof(other) == "number"){
            return new Vector2(this.x*other, this.y*other)
        }else{
            return new Vector2(this.x*other.x, this.y*other.y)
        }
    }
    div(other){
        if (typeof(other) == "number"){
            return new Vector2(this.x/other, this.y/other)
        }else{
            return new Vector2(this.x/other.x, this.y/other.y)
        }
    }
    magnitude(){
        return Math.sqrt(this.x*this.x+this.y*this.y)
    }
    unit(){
        return this.div(this.magnitude())
    }
    //Reverificar
    rotate(angle){
        let vertice = this
        angle = angle.mul(Math.PI).div(180)
        vertice = new Vector2(vertice.x, vertice.y*Math.cos(angle.x))
        vertice = new Vector2(vertice.x*Math.cos(angle.y), vertice.y)
        return vertice
    }
}

document.body.style.imageRendering = "pixelated"

let unit = 1

const game = {
    config: {
        FPS: 60
    },
    world: [],
    camera: {
        position: new Vector2(0, 0),
        velocity: new Vector2(0, 0),
        rotation: 0,
        zoom: 1
    },
    
    canvas: undefined,
    backgroundColor: "black",
    ctx: undefined,
    unitY: 0,
    running: false,
    touchScreen: 'ontouchstart' in window || navigator.msMaxTouchPoints || false
}

game.keys = {}

window.addEventListener("keydown", (event) => {
    const key = event.key
    if (game.keys[key] != undefined){
        game.keys[key] = true
    }
})
window.addEventListener("keyup", (event) => {
    const key = event.key
    if (game.keys[key] != undefined){
        game.keys[key] = false
    }
})

game.addKey = (key) => {
    game.keys[key] = false
}

const camera = game.camera

camera.worldPositionToCamera = (worldPosition) => {
    const canvasSize = new Vector2(game.canvas.width, game.canvas.height)
    return canvasSize.div(2).add(new Vector2(worldPosition.x, -worldPosition.y).mul(unit))
}
camera.cameraPositionToWorld = (cameraPosition) => {
    const canvasSize = new Vector2(game.canvas.width, game.canvas.height)
    return new Vector2((cameraPosition.x-game.canvas.width/2)/game.canvas.width*100, -(cameraPosition.y-game.canvas.height/2)/game.canvas.width*100)
}

game.getTime = () => {
    const now = new Date()
    return now.getMilliseconds()/1000+now.getSeconds()+now.getMinutes()*60+now.getHours()*60*60
}

game.start = () => {
    const body = document.body
    const styleSheet = document.createElement("style")
    styleSheet.textContext = `@import url("https://fonts.googleapis.com/css2?family=Pixelify+Sans&display=swap");`
    body.style.height = "100%"
    body.style.margin = 0
    body.style.padding = 0
    
    /**@type {HTMLCanvasElement}*/
    game.canvas = document.createElement("canvas")
    body.appendChild(game.canvas)
    game.canvas.style.width = "100vw"
    game.canvas.style.height = "100vh"
    game.canvas.style.display = "block"
    game.canvas.height = window.innerHeight
    game.canvas.width = window.innerWidth
    game.canvas.style.zIndex = 0
    game.unitY = game.canvas.height/game.canvas.width
    game.running = true
    game.ctx = game.canvas.getContext("2d")
}

class Sprite{
    constructor(name, size, position){
        this.name = name
        this.size = size
        this.position = position
        this.image = new Image()
        game.world.push(this)
    }
    destroy(){
        game.world.splice(game.world.indexOf(this), 1)
    }
}

game.checkCollision = (sprite, other) => {
    let position = sprite.position
    let velocity = sprite.velocity
    let collision = false

    if (sprite.position.x-sprite.size.x/2 < other.position.x+other.size.x/2 && sprite.position.y-sprite.size.y/2 < other.position.y+other.size.y/2 && sprite.position.y+sprite.size.y/2 > other.position.y-other.size.y/2 && sprite.position.x+sprite.size.x/2 > other.position.x-other.size.x/2){
        let sidesDistance = {
            "rightSide": sprite.position.x+sprite.size.x/2 - other.position.x-other.size.x/2,
            "leftSide": sprite.position.x-sprite.size.x/2 - other.position.x+other.size.x/2,
            "upperSide": sprite.position.y+sprite.size.y/2 - other.position.y-other.size.y/2,
            "downSide": sprite.position.y-sprite.size.y/2 - other.position.y+other.size.y/2
        }
        let mostNear = []
        for (let [side, distance] of Object.entries(sidesDistance)){
            distance = Math.abs(distance)
            if (mostNear.length == 0){
                mostNear = [side, distance]
            }
            if (mostNear[1] > distance){
                mostNear = [side, distance]
            }
        }
        console.log(sidesDistance)
        if (mostNear[0] == "leftSide"){
            position.x = other.position.x-other.size.x/2-sprite.size.x/2
            velocity = new Vector2(-sprite.velocity.x, sprite.velocity.y)
        }
        if (mostNear[0] == "rightSide"){
            position.x = other.position.x+other.size.x/2+sprite.size.x/2
            velocity = new Vector2(-sprite.velocity.x, sprite.velocity.y)
        }
        if (mostNear[0] == "upperSide"){
            position.y = other.position.y+other.size.y/2+sprite.size.y/2
            velocity = new Vector2(-sprite.velocity.x, sprite.velocity.y)
        }
        if (mostNear[0] == "downSide"){
            position.y = other.position.y-other.size.y/2-sprite.size.y/2
            velocity = new Vector2(-sprite.velocity.x, sprite.velocity.y)
        }
        collision = true
    }
    return [collision, position, velocity]
}

game.updateFrame = (dt) => {}
game.beforeDraw = () => {}
game.drawFrame = () => {}

const wait = time => new Promise(res => setTimeout(res, time))
async function _load(){
    while (true){
        const dt = 1/game.config.FPS
        if (game.running){
            game.canvas.height = window.innerHeight
            game.canvas.width = window.innerWidth
            game.updateFrame(dt)
            //game.unitY = game.canvas.height/game.canvas.width
            game.ctx.fillStyle = game.backgroundColor
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height)
            unit = game.canvas.width/100
            game.ctx.imageSmoothingEnabled = false
            game.beforeDraw()
            for (sprite of game.world){
                const size = sprite.size.mul(unit)
                const worldPosition = sprite.position
                const position = game.camera.worldPositionToCamera(worldPosition).sub(size.div(2))
                game.ctx.drawImage(sprite.image, position.x, position.y, size.x, size.y)
            }
            game.drawFrame()
        }
        
        await wait(dt*1000)
    }
}
_load()