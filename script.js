game.start()
const pieceSize = 2
const ambientSize = new Vector2(10, 20)

const background = new Sprite("background", ambientSize.mul(pieceSize), new Vector2(0, 0))
background.image.src = "assets/images/background.png"

game.backgroundColor = "rgb(30, 30, 30)"
let id = 0
let selectedPieces = []
let selectedKey = undefined
const pieceColors = ["blue", "red", "green", "yellow"]
let playersList = []
let player = {
    "name": "Jogador 1",
    "score": 0,
    "pieces": [],
    "corner": new Vector2(-ambientSize.x*pieceSize/2+pieceSize/2+Math.floor(ambientSize.x/2)*pieceSize, ambientSize.y*pieceSize/2+pieceSize),
    "rotation": 0
}
playersList.push(player)
const downSpeed = 2
const gravity = pieceSize*3
let playing = true
game.addKey("s")

const selectedPiecesMap = [
    {
        "size": new Vector2(1, 1),
        "piecesMatrix": [
            [new Vector2(0, 0)],
            [new Vector2(0, 0)],
            [new Vector2(0, 0)],
            [new Vector2(0, 0)]
        ]
    },
    {
        "size": new Vector2(2, 3),
        "piecesMatrix": [
            [new Vector2(0, 0), new Vector2(0, 1), new Vector2(0, 2), new Vector2(1, 0)],
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(0, 1)],
            [new Vector2(0, 0), new Vector2(0, -1), new Vector2(0, -2), new Vector2(-1, 0)],
            [new Vector2(0, 0), new Vector2(-1, 0), new Vector2(-2, 0), new Vector2(0, -1)],
        ]
    },
    {
        "size": new Vector2(2, 3),
        "piecesMatrix": [
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(0, -1)],
            [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0), new Vector2(-1, 0)],
            [new Vector2(0, 0), new Vector2(-1, 0), new Vector2(0, -1), new Vector2(0, 1)],
            [new Vector2(0, 0), new Vector2(0, -1), new Vector2(-1, 0), new Vector2(1, 0)]
        ]
    },
    {
        "size": new Vector2(2, 2),
        "piecesMatrix": [
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)],
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1)]
        ]
    },
    {
        "size": new Vector2(1, 4),
        "piecesMatrix": [
            [new Vector2(0, 0), new Vector2(0, 1), new Vector2(0, 2), new Vector2(0, 3)],
            [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0)],
            [new Vector2(0, 0), new Vector2(0, -1), new Vector2(0, -2), new Vector2(0, -3)],
            [new Vector2(0, 0), new Vector2(-1, 0), new Vector2(-2, 0), new Vector2(-3, 0)],
        ]
    }
]

function destroyPiece(piece){
    player.pieces.splice(player.pieces.indexOf(piece), 1)
    piece.destroy()
}

function printAmbientPieces(){
    console.log(`-----------SelectedPieces-tamanho: ${player.pieces.length}------------`)
    for (const piece of player.pieces){
        console.log(`piece.name: ${piece.name}`)
        console.log(`.position.y: ${piece.position.y}`)
        console.log(`.playing: ${piece.playing}`)
        console.log(`--------`)
    }
}

function newPiece(position, color="red", offSet=new Vector2(0, 0)){
    position = position.mul(pieceSize)
    let piece = new Sprite("piece-"+id, new Vector2(pieceSize, pieceSize), player.corner.add(position).add(offSet))
    piece.playing = true
    piece.image.src = `assets/images/piece-${color}.png`
    id++
    return piece
}

function newSelectedPieces(){
    player.rotation = 0
    if (selectedPieces != []){
        const selectedPiecesCopy = [...selectedPieces]
        selectedPieces = []
        for (const piece of selectedPiecesCopy){
            let diff = player.corner.sub(new Vector2(Math.floor(player.corner.x/pieceSize)*pieceSize, Math.floor(player.corner.y/pieceSize)*pieceSize-pieceSize/2))
            piece.position = new Vector2(Math.floor(piece.position.x/pieceSize)*pieceSize, Math.floor(piece.position.y/pieceSize)*pieceSize).add(diff)
            piece.playing = false
            console.log("pushing piece "+selectedPiecesCopy.length)
            player.pieces.push(piece)
            
        }
    }
    const color = pieceColors[Math.floor(Math.random()*pieceColors.length)]
    selectedPieces = []
    selectedKey = selectedPiecesMap[Math.floor(Math.random()*selectedPiecesMap.length)]
    for (const piecePosition of selectedKey["piecesMatrix"][0]){
        selectedPieces.push(newPiece(piecePosition, color, new Vector2(0, pieceSize*4)))
    }
}
newSelectedPieces()

function reset(){
    console.log("reset()")
    let ambientPieces = [...player.pieces]
    for (const piece of ambientPieces){
        destroyPiece(piece)
    }
    for (const piece of selectedPieces){
        piece.destroy()
    }
    selectedPieces = []
    newSelectedPieces()
}

function checkCollisionByPosition(piecePos){
    let ambientPieces = [...player.pieces]
    let collision = false
    for (const other of ambientPieces){
        if (piecePos.y-pieceSize/2 < other.position.y+pieceSize/2 && piecePos.x-pieceSize/2 < other.position.x+pieceSize/2 && piecePos.x+pieceSize/2 > other.position.x-pieceSize/2){
            if (piecePos.x == other.position.x){
                collision = true
            }
        }
            
        if (other.position.y > ambientSize.y*pieceSize/2){
            collision = true
        }

        
    }
    return collision
}

function checkCollision(lateralMovement=0){
    let ambientPieces = [...player.pieces]
    let collision = [false, undefined, undefined]
    for (const piece of selectedPieces){
        for (const other of ambientPieces){
            if (piece.position.y-piece.size.y/2 < other.position.y+other.size.y/2 && piece.position.x-piece.size.x/2 < other.position.x+other.size.x/2 && piece.position.x+piece.size.x/2 > other.position.x-other.size.x/2){
                if (piece.position.x == other.position.x){
                    collision = [true, piece, other]
                }
            }
            
            if (other.position.y > ambientSize.y*pieceSize/2){
                collision = [true, piece, background]
            }
            
        }
    }
    if (collision[0]){
        if (collision[2] == background){
            reset()
        }else{
            if (lateralMovement!=0){
                for (const piece of selectedPieces){
                    piece.position.x -= lateralMovement*pieceSize
                }
                newSelectedPieces()
            }
            if (collision[1].position.x == collision[2].position.x){   
                collision[1].position = new Vector2(collision[2].position.x, collision[2].position.y+pieceSize)
                newSelectedPieces()
            }
        }
    }
    return collision
}

window.addEventListener("keydown", (event) => {
    if (event.key == "d"){
        let canMove = true
        for (const piece of selectedPieces){
            if (piece.position.x+pieceSize/2 >= ambientSize.x/2*pieceSize){
                canMove = false
            }
        }
        if (canMove){
            for (const piece of selectedPieces){
                piece.position.x += pieceSize
            }
            const collision = checkCollision(1)
        }
    }
    if (event.key == "a"){
        let canMove = true
        for (const piece of selectedPieces){
            if (piece.position.x-pieceSize/2 <= -ambientSize.x/2*pieceSize){
                canMove = false
            }
        }
        if (canMove){
            for (const piece of selectedPieces){
                piece.position.x -= pieceSize
            }
            const collision = checkCollision(-1)
        }
    }
    if (event.key == "w"){
        const rootPosition = selectedPieces[0].position
        const rootImageSrc = selectedPieces[0].image.src
        let canMove = true
        let newRotation = player.rotation+1
        if (newRotation > 3){
            newRotation = 0
        }
        const newSelectedPieces = selectedKey["piecesMatrix"][newRotation]
        for (const piecePosition of newSelectedPieces){
            let realPos = player.corner.add(piecePosition).add(rootPosition.sub(player.corner))
            const collision = checkCollisionByPosition(realPos)
            if (collision){
                console.log("canMove = false")
                canMove = false
            }
        }
        if (canMove){
            
            player.rotation = newRotation
            const selectedPiecesCopy = [...selectedPieces]
            for (const oldPiece of selectedPiecesCopy){
                game.world.splice(game.world.indexOf(oldPiece), 1)
            }
            selectedPieces = []
            for (const piecePosition of newSelectedPieces){
                console.log(piecePosition)
                const piece = newPiece(piecePosition, "red", rootPosition.sub(player.corner))
                piece.image.src = rootImageSrc
                piece.playing = true
                selectedPieces.push(piece)
            }
            console.log(player.pieces.length)
        }
        
    }
    if (event.key == "m"){
        playing = !playing
    }
})
game.updateFrame = (dt) => {
    if (playing){
        let onGround = false
        for (const piece of selectedPieces){
            if (game.keys["s"]){
                piece.position.y -= gravity*downSpeed*dt
            }
            piece.position.y -= gravity*dt
            if (piece.position.y < -ambientSize.y*pieceSize/2+pieceSize/2){
                onGround = true
            }
            
        }
        if (onGround){
            newSelectedPieces()
        }
        const collision = checkCollision()
        if (collision[0]){
            
        }
        

        let eachRow = {}
        for (other of player.pieces){
            if (eachRow[other.position.y] == undefined){
                eachRow[other.position.y] = []
            }
            eachRow[other.position.y].push(other)
        }
        for (const [row, pieces] of Object.entries(eachRow)){
            if (pieces.length >= ambientSize.x){
                for (const piece of pieces){
                    destroyPiece(piece)
                }
                
                for (const [row2, pieces2] of Object.entries(eachRow)){
                    if (parseInt(row) < parseInt(row2)){
                        for (const piece of pieces2){
                            piece.position.y -= pieceSize
                        }
                    }
                }
            }
        }
    }
}