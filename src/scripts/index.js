console.log('webpack starterkit');

let chutePulled = false;   // tracks when chute is pulled
let jumperInAir = false;    // Tracks when leaves plane
let gravityFreeFall = 1.75;   // bigger number faster fall
let gravityChute = .75;   // bigger number faster fall
let planeInertiaInfluance = .01;  // bigger number slows jumper down more quickly upon jump (pre chute)


var parachuteGamePiece;
var planeGamePiece;
var landingPadGamePiece;
var abulanceGamePiece;
var windSock;

function startGame() {
    let num = (Math.random()*2).toFixed(2);
    console.log (`Random Number: ${num}`);


    planeGamePiece = new component(30, 15, "blue", 580, 10);
    parachuteGamePiece = new component(30, 30, "red", 580, 10);
    abulanceGamePiece = new component(25, 15, "yellow", 570, 380);
    landingPadx = (Math.floor(Math.random() * 500 ))
    console.log (`Landingpad x ${landingPadx}`);
    landingPadGamePiece = new component(50, 5, "green", landingPadx, 395);
    windSock = new component(3, 60, "violet", 20, 340);
    
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
          })
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
          })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function updateGameArea() {
    myGameArea.clear();
    parachuteGamePiece.speedX = 0;
    parachuteGamePiece.speedY = 0;
    parachuteGamePiece.update();
    if (myGameArea.key && myGameArea.key == 37) {myGamePiece.speedX = -1; }
    if (myGameArea.key && myGameArea.key == 39) {myGamePiece.speedX = 1; }
    if (myGameArea.key && myGameArea.key == 38) {myGamePiece.speedY = -1; }
    if (myGameArea.key && myGameArea.key == 40) {myGamePiece.speedY = 1; }
    parachuteGamePiece.newPos(); 
    parachuteGamePiece.update();
    planeGamePiece.speedX = 0;
    planeGamePiece.newPos();
    planeGamePiece.update();
};


// --------- auto locators



// ---------  button control

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y; 
    this.update = function() {
      ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
      this.x += this.speedX;
      this.y += this.speedY; 
    } 
  }
  
  function updateGameArea() {

    if ( jumperInAir && !chutePulled && (parachuteGamePiece.speedX <= 0 ) ) {
        parachuteGamePiece.speedX += planeInertiaInfluance;     //slow down initial plane inertia 
        if (parachuteGamePiece.speedX >= 0 ) console.log (`jumper zero`);
    }; 
    myGameArea.clear();
    
    parachuteGamePiece.newPos();
    planeGamePiece.newPos();
    landingPadGamePiece.newPos();
    abulanceGamePiece.newPos();
    windSock.newPos();

    parachuteGamePiece.update();
    planeGamePiece.update();
    landingPadGamePiece.update();
    abulanceGamePiece.update();
    windSock.update();
  }
  
  function moveleft() {
      if ( jumperInAir && chutePulled && parachuteGamePiece.speedX > -1.5 ) {
        parachuteGamePiece.speedX -= .25;      
      };
    }
  
  function moveright() {
      if ( jumperInAir && chutePulled && parachuteGamePiece.speedX < 1.5 ) {
          parachuteGamePiece.speedX += .25;
      };
  }

  function reset() {
    planeGamePiece.x = 580;
    planeGamePiece.speedX = 0;
    parachuteGamePiece.x = 580;
    parachuteGamePiece.y = 10;
    parachuteGamePiece.speedX = planeGamePiece.speedX;
    parachuteGamePiece.speedY = 0;
    chutePulled = false;
    jumperInAir = false;
    landingPadx = (Math.floor(Math.random() * 500 ));
    landingPadGamePiece.x = landingPadx;
  }


  function flyplane() {
    let planeSpeed = -(Math.random()*2).toFixed(2);
    planeGamePiece.speedX = planeSpeed
    parachuteGamePiece.x = planeGamePiece.x;
    parachuteGamePiece.speedX = planeGamePiece.speedX;
  };

  function jump() {
    if ( jumperInAir ) {
       chutePulled = true    // set w/ second push of button
    };   
    jumperInAir = true;  
    if ( chutePulled ) {
        parachuteGamePiece.speedY = gravityChute;
    }  
    else {
        parachuteGamePiece.speedY = gravityFreeFall;
    };
  };



