console.log('webpack starterkit');

//counters and holders
let chutePulled = false;   // tracks when chute is pulled
let chuteFullyDeployed = false;  //happens fixed time after pulled
let chuteTimerSet = false;
let jumperInAir = false;    // Tracks when leaves plane
let windToloranceTimer = 9999999;  // counter (start large to invoke first wind)
let letGoOfJump = false;    // checks for double push of jump via keyboard
let firstChutePull = true;  // checks for first verse subsquent attempts at deploying chute
let gameScoreAccumulator = 0;


// letiables that adjust game play
const screenUpdateInterval = 20;   // Alters screen update speed
const gravityFreeFall = 1.75;   // bigger number faster fall
const gravityChute = .75;   // bigger number faster fall
const chuteOpeningTime = 1000; // time in mils
const planeInertiaInfluance = .01;  // bigger number slows jumper down more quickly upon jump (pre chute)
let   windCurrent = Math.floor(Math.random() * 5 ) - 2;  // 5 letiations; negative is West, 0 neutral, Pos is East
const windChangeRate = 300;   // 0 to 100 rate of wind change.  0 Most Agressive, 100 most time between changes
const parachuteLRInfluance = .175;  // bigger number, the more the chute can go L or R when pulled
const scoreMatrix = [120, 220, 340, 550, 680];
const parachuteLRMax = {   // fastest speeds allowed during varying winds
    west2Max: -1.75,    west2Min: -.25,     west2ChuteDefault: -.5,
    west1Max: -1,       west1Min: .5,       west1ChuteDefault: -.25,
    neutralW: -.75,     neutralE: .75,      neutralChuteDefault: 0,
    east1Max: 1,        east1Min: -.5,      east1ChuteDefault: .25,
    east2Max: 1.75,     east2Min: .25,      east2ChuteDefault: .5
};

//keyboard influance
const moveLeftKey = 37; //left arrow
const moveRightKey = 39; //left arrow
const jumpKey = 32;  // space bar
const flyPlaneKey = 71;  // G
const resetKey = 82;  // R


// game pieces
let parachuteGamePiece;
let planeGamePiece;
let landingPadGamePiece;
let abulanceGamePiece;
let windSockW2;
let windSockW1;
let windSock0;
let windSockE1;
let windSockE2;
let roundScore;
let gameScore;

function startGame() {
    //let num = (Math.random()*2).toFixed(2);
    //let num = ((Math.random()) - .5).toFixed(3)
    let num = Math.floor(Math.random() * 5 ) - 2;
    console.log (`Random Number: ${num}`);


    planeGamePiece = new component(30, 15, "blue", 580, 10);
    parachuteGamePiece = new component(30, 30, "red", 580, 10);
    abulanceGamePiece = new component(25, 15, "yellow", 570, 380);
    landingPadx = (Math.floor(Math.random() * 500 ))
    landingPadGamePiece = new component(60, 5, "green", landingPadx, 395);
    roundScore = new component("20px", "Consolas", "black", landingPadx, 380, "score");
    gameScore = new component("20px", "Consolas", "black", 3, 15, "GameScore");
    windSockW2 = new component(40, 10, "red", 0, 340);
    windSockW1 = new component(20, 10, "violet", 20, 340);
    windSock0 = new component(3, 60, "violet", 40, 340);
    windSockE1 = new component(20, 10, "violet", 40, 340);
    windSockE2 = new component(40, 10, "red", 40, 340);

    
    myGameArea.start();
}

let myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, screenUpdateInterval);
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
          })
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
                if (e.keyCode == jumpKey) {
                    letGoOfJump = true;
                }
          })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
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


// --------- auto locators



// ---------  button control

function component(width, height, color, x, y, text) {
    this.text = text;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y; 
    this.update = function() {
        ctx = myGameArea.context;
        if (this.text != null) {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }  //end if for text
    };
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY; 
    } 
    this.landedSafely = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var landed = true;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
          landed = false;
        }
        return landed;
    }
    this.splat = function(otherobj) {
        var mybottom = this.y + (this.height);
        let splatted = false;
        if (mybottom < 1) {
            splatted = true
        }
        return splatted;
    }
}

function updateGameArea() {
    
    if ( jumperInAir && !chutePulled && (parachuteGamePiece.speedX <= 0 ) ) {  //plane only heads West
        parachuteGamePiece.speedX += (planeInertiaInfluance / 2);     //slow down para from initial plane inertia 
        if (parachuteGamePiece.speedX >= 0 ) {
            parachuteGamePiece.speedX = 0;
        };
    }; 

    if ( jumperInAir && !chutePulled ) {
        
        if ( parachuteGamePiece.y.between(   1, 150) ) roundScore.text = scoreMatrix[1];
        if ( parachuteGamePiece.y.between( 151, 250) ) roundScore.text = scoreMatrix[2];
        if ( parachuteGamePiece.y.between( 251, 320) ) roundScore.text = scoreMatrix[3];
        if ( parachuteGamePiece.y.between( 321, 400) ) roundScore.text = scoreMatrix[4];
        if ( parachuteGamePiece.y.between( 401, 600) ) roundScore.text = scoreMatrix[5];
    };
    
    if ( windToloranceTimer > windChangeRate ) {
        windCurrent = influanceWind(windCurrent);
        windToloranceTimer = 0;  //reset to start counting again
    }  //end of if
    windToloranceTimer += 1
    // console.log (`Wind Current:  ${windCurrent}`);
    
    if ( chutePulled && !chuteFullyDeployed && !chuteTimerSet) {
        chuteDeploymentTimer = Date.now();
        chuteTimerSet = true;
    }
    
    if (chutePulled && !chuteFullyDeployed && chuteTimerSet) {
        if ((Date.now() - chuteDeploymentTimer) > chuteOpeningTime) {
            chuteFullyDeployed = true;
            parachuteGamePiece.fillStyle = 'green';
        }
    }

    
    if (myGameArea.key && myGameArea.key == moveLeftKey) { moveleft()  }  // left arrow
    if (myGameArea.key && myGameArea.key == moveRightKey) { moveright() }  //right arrow
    if (myGameArea.key && myGameArea.key == flyPlaneKey) { flyplane() }  //G for Go (fly plane)
    if (myGameArea.key && myGameArea.key == resetKey) { reset() }  //R for Reset
    if (myGameArea.key && myGameArea.key == jumpKey) { jump() }  //press space
    
    if ( chuteFullyDeployed && parachuteGamePiece.landedSafely(landingPadGamePiece)) {
            gameScoreAccumulator += roundScore.text
            reset();

        } else if (parachuteGamePiece.splat()) {
            // no score, reset
            reset();
        } else {
        myGameArea.clear();
        
        roundScore.newPos();
        gameScore.newPos();
        parachuteGamePiece.newPos();
        planeGamePiece.newPos();
        landingPadGamePiece.newPos();
        abulanceGamePiece.newPos();
        
        roundScore.update();
        gameScore.update();
        parachuteGamePiece.update();
        planeGamePiece.update();
        landingPadGamePiece.update();
        abulanceGamePiece.update();
    }
    
    switch (windCurrent) {    //update wind sock
        case -2:
            windSockW2.newPos();
            windSockW2.update();
            windSock0.newPos();
            windSock0.update();
            break;
        case -1:
            windSockW1.newPos();
            windSockW1.update();
            windSock0.newPos();
            windSock0.update();
            break;
        case 0:
            windSock0.newPos();
            windSock0.update();
            break;
        case 1:
            windSockE1.newPos();
            windSockE1.update();
            windSock0.newPos();
            windSock0.update();
            break;
        case 2:
            windSockE2.newPos();
            windSockE2.update();
            windSock0.newPos();
            windSock0.update();
            break;
        default:
            console.log (`Error in Wind Case`);
            break;
    };  //end of wind switch
}

function moveleft() {
      if ( jumperInAir && chutePulled ) {
        //windCurrent = -2                                                   // <----------    remove!!
          console.log (`entering switchL: ${parachuteGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                parachuteGamePiece.speedX += (-parachuteLRInfluance);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west2Max;
                } 
                // if (parachuteGamePiece.speedX >= parachuteLRMax.west2Min ) {
                //         parachuteGamePiece.speedX = parachuteLRMax.west2Min;
                // }; 
                break;
            case -1:  // westwardly mild wind
                parachuteGamePiece.speedX += (-parachuteLRInfluance);
                if ( parachuteGamePiece.speedX <= parachuteLRMax.west1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west1Max;
                } 
                // if (parachuteGamePiece.speedX >= parachuteLRMax.west1Min ) {
                //         parachuteGamePiece.speedX = parachuteLRMax.west1Min;
                // };
                break;
            case 0:   //no influance
                parachuteGamePiece.speedX += -parachuteLRInfluance;
                if ( parachuteGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    parachuteGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                if (parachuteGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        parachuteGamePiece.speedX = parachuteLRMax.neutralE;
                };
                break;
            case 1:  // eastwardly mild wind
                parachuteGamePiece.speedX += -(parachuteLRInfluance);
                // if ( parachuteGamePiece.speedX >= parachuteLRMax.east1Max ) {
                //     parachuteGamePiece.speedX = parachuteLRMax.east1Max;
                // } 
                if (parachuteGamePiece.speedX <= parachuteLRMax.east1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.east1Min;
                };
                break;
            case 2:  // eastwardly strong wind
                parachuteGamePiece.speedX += -(parachuteLRInfluance);
                // if ( parachuteGamePiece.speedX >= parachuteLRMax.east2Max ) {
                //     parachuteGamePiece.speedX = parachuteLRMax.east2Max;
                // } 
                if ( parachuteGamePiece.speedX <= parachuteLRMax.east2Min ) {
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
    //windCurrent = -2                                                   // <----------    remove!!
    if ( jumperInAir && chutePulled ) {
        console.log (`entering switchR: ${parachuteGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                parachuteGamePiece.speedX += (parachuteLRInfluance);
                // if ( parachuteGamePiece.speedX <= parachuteLRMax.west2Max ) {
                //     parachuteGamePiece.speedX = parachuteLRMax.west2Max;
                //     console.log (`in if wedt2Max`);
                // } 
                if ( parachuteGamePiece.speedX >= parachuteLRMax.west2Min ) {
                    parachuteGamePiece.speedX = parachuteLRMax.west2Min;
                };
                break;
            case -1:  // westwardly mild wind
                parachuteGamePiece.speedX += (parachuteLRInfluance);
                // if ( parachuteGamePiece.speedX <= parachuteLRMax.west1Max ) {
                //     parachuteGamePiece.speedX = parachuteLRMax.west1Max;
                // } 
                if (parachuteGamePiece.speedX >= parachuteLRMax.west1Min ) {
                        parachuteGamePiece.speedX = parachuteLRMax.west1Min;
                };
                break;
            case 0:   //no influance
                parachuteGamePiece.speedX += parachuteLRInfluance;
                if ( parachuteGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    parachuteGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                if (parachuteGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        parachuteGamePiece.speedX = parachuteLRMax.neutralE;
                }; 
                break;
            case 1:  // eastwardly mild wind
                parachuteGamePiece.speedX += (parachuteLRInfluance);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east1Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east1Max;
                } 
                // if (parachuteGamePiece.speedX <= parachuteLRMax.east1Min ) {
                //         parachuteGamePiece.speedX = parachuteLRMax.east1Min;
                // }; 
                break;
            case 2:  // eastwardly strong wind
                parachuteGamePiece.speedX += (parachuteLRInfluance);
                if ( parachuteGamePiece.speedX >= parachuteLRMax.east2Max ) {
                    parachuteGamePiece.speedX = parachuteLRMax.east2Max;
                } 
                // if (parachuteGamePiece.speedX <= parachuteLRMax.east2Min ) {
                //         parachuteGamePiece.speedX = parachuteLRMax.east2Min;
                // };
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
    roundScore.x = landingPadx;
    roundScore.text = 'score';
    windCurrent = Math.floor(Math.random() * 5 ) - 2;
    letGoOfJump = false;
    firstChutePull = true;
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

  Number.prototype.between = function(a, b, inclusive) {
    var min = Math.min(a, b),
      max = Math.max(a, b);
  
    return inclusive ? this >= min && this <= max : this > min && this < max;
  }
  

  function flyplane() {
    let planeSpeed = -(Math.random()*2).toFixed(2);
    planeGamePiece.speedX = planeSpeed
    parachuteGamePiece.x = planeGamePiece.x;
    parachuteGamePiece.speedX = planeGamePiece.speedX;
  };

  function jump() {
    if ( jumperInAir && letGoOfJump ) {
       chutePulled = true    // set w/ second push of button
    };   

    jumperInAir = true;  
    
    if ( chutePulled && firstChutePull ) {
        parachuteGamePiece.speedY = gravityChute;
        switch (windCurrent) {
            case -2:
                parachuteGamePiece.speedX = parachuteLRMax.west2ChuteDefault
                break;
            case -1:
                parachuteGamePiece.speedX = parachuteLRMax.west1ChuteDefault
                break;
            case 0:
                parachuteGamePiece.speedX = parachuteLRMax.neutralChuteDefault
                break;
            case 1:
                parachuteGamePiece.speedX = parachuteLRMax.east1ChuteDefault
                break;
            case 2:
                parachuteGamePiece.speedX = parachuteLRMax.east2ChuteDefault
                break;
            default:
                console.log (`Error in firstChutePulled case stmt`);
        } // end firstPulledChute case
        
        
        moveright(); //wiggle jumper to invoke wind influance
        moveleft(); //wiggle jumper to invoke wind influance
    }  
    else {
        parachuteGamePiece.speedY = gravityFreeFall;
    };
    
};
