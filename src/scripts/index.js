console.log('webpack starterkit');

//counters and holders
let chutePulled = false;   // tracks when chute is pulled
let jumperInAir = false;    // Tracks when leaves plane
let windToloranceTimer = 0;  // counter

// letiables that adjust game play
const gravityFreeFall = 1.75;   // bigger number faster fall
const gravityChute = .75;   // bigger number faster fall
const planeInertiaInfluance = .01;  // bigger number slows jumper down more quickly upon jump (pre chute)
let   windCurrent = Math.floor(Math.random() * 5 ) - 2;  // 5 letiations; negative is West, 0 neutral, Pos is East
const windChangeRate = 300;   // 0 to 100 rate of wind change.  0 Most Agressive, 100 most time between changes
const parachuteLRInfluance = .2;  // bigger number, the more the chute can go L or R when pulled
const parachuteLRMax = {   // fastest speeds allowed during varying winds
    west2Max: -1.75,    west2Min: -.25,
    west1Max: -1,       west1Min: .5,
    neutralW: -.75,     neutralE: .75,
    east1Max: 1,        east1Min: -.5,
    east2Max: 1.75,     east2Min: .25
};

// game pieces
let parachuteGamePiece;
let planeGamePiece;
let landingPadGamePiece;
let abulanceGamePiece;
let windSock;

function startGame() {
    //let num = (Math.random()*2).toFixed(2);
    //let num = ((Math.random()) - .5).toFixed(3)
    let num = Math.floor(Math.random() * 5 ) - 2;
    console.log (`Random Number: ${num}`);


    planeGamePiece = new component(30, 15, "blue", 580, 10);
    parachuteGamePiece = new component(30, 30, "red", 580, 10);
    abulanceGamePiece = new component(25, 15, "yellow", 570, 380);
    landingPadx = (Math.floor(Math.random() * 500 ))
    console.log (`Landingpad x ${landingPadx}`);
    landingPadGamePiece = new component(50, 5, "green", landingPadx, 395);
    windSockW2 = new component(3, 60, "violet", 20, 340);
    windSockW1 = new component(3, 60, "violet", 20, 340);
    windSock0 = new component(3, 60, "violet", 20, 340);
    windSockE1 = new component(3, 60, "violet", 20, 340);
    windSockE2 = new component(3, 60, "violet", 20, 340);
    
    myGameArea.start();
}

let myGameArea = {
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
        parachuteGamePiece.speedX += planeInertiaInfluance;     //slow down para from initial plane inertia 
        if (parachuteGamePiece.speedX >= 0 ) console.log (`jumper verticle fall`);
    }; 
        
    if ( windToloranceTimer > windChangeRate ) {
        windCurrent = influanceWind(windCurrent);
        windToloranceTimer = 0;  //reset to start counting again
    }
    windToloranceTimer += 1
    // console.log (`Wind Current:  ${windCurrent}`);
        
    myGameArea.clear();
    
    parachuteGamePiece.newPos();
    planeGamePiece.newPos();
    landingPadGamePiece.newPos();
    abulanceGamePiece.newPos();
    windSock0.newPos();

    parachuteGamePiece.update();
    planeGamePiece.update();
    landingPadGamePiece.update();
    abulanceGamePiece.update();
    windSock0.update();
  }
  
  function moveleft() {
      if ( jumperInAir && chutePulled ) {
          windCurrent = 2                                                   // <----------    remove!!
          console.log (`entering switchL: ${parachuteGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                parachuteGamePiece.speedX += (-parachuteLRInfluance + -.25);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west2Max;
                } 
                else if (parachuteGamePiece.speedX >= parachuteLRMax.west2Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.west2Min;
                }; 
                break;
            case -1:  // westwardly mild wind
                parachuteGamePiece.speedX += (-parachuteLRInfluance + -.125);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west1Max;
                } 
                else if (parachuteGamePiece.speedX >= parachuteLRMax.west1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.west1Min;
                };
                break;
            case 0:   //no influance
                parachuteGamePiece.speedX += -parachuteLRInfluance;
                if ( parachuteGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    parachuteGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                else if (parachuteGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        parachuteGamePiece.speedX = parachuteLRMax.neutralE;
                };
                break;
            case 1:  // eastwardly mild wind
                parachuteGamePiece.speedX += -(parachuteLRInfluance + .125);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east1Max;
                } 
                else if (parachuteGamePiece.speedX <= parachuteLRMax.east1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.east1Min;
                };
                break;
            case 2:  // eastwardly strong wind
                parachuteGamePiece.speedX += -(parachuteLRInfluance + .25);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east2Max;
                } 
                else if (parachuteGamePiece.speedX <= parachuteLRMax.east2Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.east2Min;
                };
                break;
            default:
                console.log (`Error in Move Left Wind Case`);
                break;
           }  //end winfCurrent switch
    };  // end if jumperInAir and chutePulled
  } // end moveLeft fn
  
  function moveright() {
    windCurrent = 2                                                   // <----------    remove!!
    if ( jumperInAir && chutePulled ) {
        console.log (`entering switchR: ${parachuteGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                parachuteGamePiece.speedX += (parachuteLRInfluance + -.25);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west2Max;
                    console.log (`in right west2Max`);
                } 
                if ( parachuteGamePiece.speedX >= parachuteLRMax.west2Min ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west2Min;
                    console.log (`in right west2min`);
                };
                break;
            case -1:  // westwardly mild wind
                parachuteGamePiece.speedX += (parachuteLRInfluance + -.125);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west1Max;
                } 
                else if (parachuteGamePiece.speedX >= parachuteLRMax.west1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.west1Min;
                };
                break;
            case 0:   //no influance
                parachuteGamePiece.speedX += parachuteLRInfluance;
                if ( parachuteGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    parachuteGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                else if (parachuteGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        parachuteGamePiece.speedX = parachuteLRMax.neutralE;
                }; 
                break;
            case 1:  // eastwardly mild wind
                parachuteGamePiece.speedX += (parachuteLRInfluance + .125);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east1Max;
                } 
                else if (parachuteGamePiece.speedX <= parachuteLRMax.east1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.east1Min;
                }; 
                break;
            case 2:  // eastwardly strong wind
                parachuteGamePiece.speedX += (parachuteLRInfluance + .25);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east2Max;
                } 
                else if (parachuteGamePiece.speedX <= parachuteLRMax.east2Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.east2Min;
                };
                break;
            default:
                console.log (`Error in Move Right Wind Case`);
                break;
           }  //end case
      }; // end if jumperInAir and chutePulled
  } //end moveRight fn

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
    windCurrent = Math.floor(Math.random() * 5 ) - 2;
  }

  function influanceWind(current) {
    let newWind = Math.floor(Math.random() * 5 ) - 2;
    let windDiff = newWind - current
    //console.log (`current ${current}, newWind: ${newWind}  windDiff: ${Math.abs(windDiff)}`);

    if ( Math.abs(windDiff) === 1 ) {   // if difference of 1, update wind
        current = newWind
    };
    if ( current > 2 ) {
        return 2
    } 
    else if ( current < -2 ) {
        return -2

    }
    else {
        return current
    };
  } // end influanceWind fn


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



