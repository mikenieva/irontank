let requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Crea el canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 480;
document.body.appendChild(canvas);

// El loop principal del juego
let lastTime;
const main = () => {
    let now = Date.now();
    let dt = (now - lastTime) / 1000.0;

    if(!isGameOver){
        distance += 1;
    }
    
    distanceEl.innerHTML = "Distancia: " + distance + " metros";

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};


const init = () => {
    ctx.drawImage(resources.get('images/terreno.bmp'),0,0);
    terrainPattern = ctx.createPattern(resources.get('images/sand.png'), 'repeat');

    ctx.font = "30px Arial";
    ctx.strokeText("Hello World",80,150);

    document.getElementById('play-again').addEventListener('click', () => {
        reset();
    });

    // Ejecución de música
    document.getElementById('music').addEventListener('click',()=>{
        if(musicStatus == true){
            musicStatus = false;
            audio.pause();
            audio.currentTime = 0;
        } else if(musicStatus == false){
            musicStatus = true;
            audio.play();            
        }
        
    })

    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    'images/player/tankplayer.png',
    'images/sand.png',
    'images/boss-minotaur/minotaur-attack1-00.png',
    'images/bullets.bmp',
    'images/terreno.bmp',
    'images/boss-minotaur/minotaur-die.png',
    'images/bulletup.png'
]);
resources.onReady(init);

// Estado del juego
let player = {
    pos: [0, 0],
    sprite: new Sprite('images/player/tankplayer.png', [0, 0], [48, 56], 10, [0, 1, 0])
};

let bullets = [];
let enemies = [];
let explosions = [];

let lastFire = Date.now();
let gameTime = 0;
let isGameOver;
let terrainPattern;
let musicStatus = false;
let audio = new Audio("music/spark.mp3");

let score = 0;
let distance = 0;
let scoreEl = document.getElementById('score');
let distanceEl = document.getElementById('distance');


// Velocidad en pixeles por segundo
let playerSpeed = 200;
let bulletSpeed = 500;
let enemySpeed = 100;

// Actualizar objetos del juego
const update = (dt) => {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt);
    // Exponencia los enemigos en pantalla
    if(Math.random() < 1 - Math.pow(.995, gameTime)) {
        enemies.push({
            pos: [canvas.width,
                  Math.random() * (canvas.height - 39)],
            sprite: new Sprite('images/boss-minotaur/minotaur-attack1-00.png', [0, 0], [74, 77],16, [0, 1, 2, 3, 2, 1])
        });
    }
    checkCollisions();

    scoreEl.innerHTML = "Score: " + score;
    
};

const handleInput = (dt) => {
    if(input.isDown('DOWN') || input.isDown('s')) {
        player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.pos[1] -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed * dt;
    }

    if(input.isDown('SPACE') &&
       !isGameOver &&
       Date.now() - lastFire > 100) {
        
        let x = player.pos[0] + player.sprite.size[0] / 2;
        let y = player.pos[1] + player.sprite.size[1] / 2;

        bullets.push({ pos: [x, y],
                       dir: 'forward',
                       sprite: new Sprite('images/bullets.bmp', [0, 0], [9, 5]) });
        bullets.push({ pos: [x, y],
                       dir: 'up',
                       sprite: new Sprite('images/bullets.bmp', [0, 0], [9, 7]) });
        bullets.push({ pos: [x, y],
                       dir: 'down',
                       sprite: new Sprite('images/bullets.bmp', [0, 0], [9, 5]) });

        lastFire = Date.now();
    }
}

const updateEntities = (dt) => {
    // Update the player sprite animation
    player.sprite.update(dt);

    // Update all the bullets
    for(let i=0; i<bullets.length; i++) {
        let bullet = bullets[i];

        switch(bullet.dir) {
        case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
        case 'down': bullet.pos[1] += bulletSpeed * dt; break;
        default:
            bullet.pos[0] += bulletSpeed * dt;
        }

        // Quitar las balas si salen del canvas
        if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
           bullet.pos[0] > canvas.width) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Refrescar a todos los enemigos
    for(let i=0; i<enemies.length; i++) {
        enemies[i].pos[0] -= enemySpeed * dt;
        enemies[i].sprite.update(dt);

        // Remover si salen fuera de pantalla
        if(enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Refrescar todas las explosiones
    for(let i=0; i<explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
            explosions.splice(i, 1);
            i--;
        }
    }
}

// Collisions

const collides = (x, y, r, b, x2, y2, r2, b2) => {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

const boxCollides = (pos, size, pos2, size2) => {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

const checkCollisions = () => {
    //Forza al enemigo dentro del CANVAS
    checkPlayerBounds();
    
    // Detección de colisiones para los enemigos con el jugador
    for(let i=0; i<enemies.length; i++) {
        let pos = enemies[i].pos; // Posición de la bala
        let size = enemies[i].sprite.size; // Tamaño de los enemigos

        for(let j=0; j<bullets.length; j++) {
            let pos2 = bullets[j].pos;
            let size2 = bullets[j].sprite.size;

            if(boxCollides(pos, size, pos2, size2)) {
                // Remover enemigos
                enemies.splice(i, 1);
                i--;

                // Agregar Score
                score += 100;

                if (score == 800){
                    console.log("Fuckin' Awesome!");
                } else if (score == 5000){
                    console.log("Nice shot!");
                } else if (score == 10000){
                    console.log("Keep moving on!");
                } else if (score == 20000){
                    console.log("20000! That's great!");
                } else if (score == 80000){
                    console.log("80000! A big boss is approaching!");
                }

                // Agregar una explosión
                explosions.push({
                    pos: pos,
                    sprite: new Sprite('images/boss-minotaur/minotaur-die.png',[0, 0],                                       [73, 78],14,[0, 1, 2, 3, 4, 5],null,true)
                });

                // Quita la bala y detén la iteración
                bullets.splice(j, 1);
                break;
            }
        }

        if(boxCollides(pos, size, player.pos, player.sprite.size)) {
            gameOver();
        }
    }
}

const checkPlayerBounds = () => {
    // Check bounds
    if(player.pos[0] < 0) {
        player.pos[0] = 0;
    }
    else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
        player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if(player.pos[1] < 0) {
        player.pos[1] = 0;
    }
    else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
        player.pos[1] = canvas.height - player.sprite.size[1];
    }
}

// Dibujar todo
const render = () => {
    ctx.fillStyle = terrainPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderear el juego si no hay Game Over
    if(!isGameOver) {
        renderEntity(player);
    }

    renderEntities(bullets);
    renderEntities(enemies);
    renderEntities(explosions);
};

const renderEntities = (list) => {
    for(let i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}

const renderEntity = (entity) => {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}

// Game over
const gameOver = () => {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    
    audio.pause();
    audio.currentTime = 0;

    isGameOver = true;
}

// Reset game to original state
const reset = () => {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    isGameOver = false;
    gameTime = 0;
    score = 0;
    distance = 0;
    enemies = [];
    bullets = [];

    player.pos = [50, canvas.height / 2];
};