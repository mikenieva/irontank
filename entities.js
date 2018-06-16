// 1. Personajes
class Character {
    constructor(life, attackPower, width, height, x, y, speedX, speedY, src){
    this.life = life;
    this.attackPower = attackPower;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.src = src;
    }
}

class Player extends Character {
  // Debe tener movimiento
    moveLeft(){
      this.x -= 25;
    }
    moveRight(){
      this.x += 25;
    }
    moveUp(){
      this.y -= 25;
    }
    moveDown(){
      this.y += 25;
    }

  shoot(damage){
    console.log("Disparamos bala");
    //if(){
    //      giveDamage()// Si hay un hit, entonces invocas giveDamage()
    //}
    var bulletPosition = this.midpoint();
    
    playerBullets.push(Bullet({
      speed: 5,
      x: bulletPosition.x,
      y: bulletPosition.y
    }));
  
    
    return damage;
  }

    midpoint() {
      return {
        x: this.x + this.width/2,
        y: this.y + this.height/2
      };
    };

  giveDamage(damage){
      // Se hace una resta de life - attack
      // Si life < attack, entonces, invocamos una función de "eliminación"
      return damage
    }
  receiveDamage(damage){
      // Si life < attack, entonces, invocamos una función de "eliminación"
    }
}

// 2. Enemigos
class Enemy extends Character{

}

// 2a. Bajo Rango Tanque Enemigo

class LowerTank extends Enemy{
  moveLeft(){
    
  }
  stopMovement(){

  }
}

// 3. Jefes

class Boss extends Character{
  run(){
  }
  attack1(){
  }

  attack2(){
  }

  hurt(){

  }

  idle(){
  }
} 

// 4. Balas

class Bullet{
  constructor(I){

  I.active = true;
  
  I.xVelocity = 0;
  I.yVelocity = -I.speed;
  I.width = 3;
  I.height = 3;
  I.color = "#000";

  I.inBounds = function() {
    return I.x >= 0 && I.x <= CANVAS_WIDTH &&
      I.y >= 0 && I.y <= CANVAS_HEIGHT;
  };

  I.draw = function() {
    canvas.fillStyle = this.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
  };

  I.update = function() {
    I.x += I.xVelocity;
    I.y += I.yVelocity;

    I.active = I.active && I.inBounds();
  };


  return I;
  }

 
}

//5. Escenarios

class Obstacle{
    constructor(width, height){
      this.width = width;
      this.height = height;
    }
}

// Items
class Items{
  constructor(){

  }
}
// Puntuación
class Score{
    constructor(hits){
      this.hits = hits
    }
}

// Barra de energía

class Energy{
  constructor(maxLife){
    this.maxLife = maxLife;
  }
}
