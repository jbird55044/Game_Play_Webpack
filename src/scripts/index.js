console.log('webpack starterkit');
console.log (`!Vatti Rocks!`);

//HTML IDs
const gameButtonsDiv = document.getElementById("gameButtonsDiv");
const headerDiv = document.getElementById("headerDiv");
const highScoreDiv = document.getElementById("highScoreDiv");
const restartGameDiv = document.getElementById("restartGameDiv");
const body1 = document.getElementById("body1");
const jumpButton = document.getElementById("jumpButton");
const moveLeftButton = document.getElementById("moveLeftButton");
const moveRightButton = document.getElementById("moveRightButton");
const goGameButton = document.getElementById("goGameButton");

// setiables that adjust game play
const totalLifes = 3;
const canvasY = 400;
const canvasX = 600;
const screenUpdateInterval = 20;   // Alters screen update speed
const gravityFreeFall = 1.75;   // bigger number faster fall
const gravityChute = .75;   // bigger number faster fall
const chuteOpeningTime = 1250; // time in millisecs
const planeInertiaInfluance = .01;  // bigger number slows jumper down more quickly upon jump (pre chute)
const planeMinimumSpeed = 1.1;
const planeMaximumSpeed = 2.8;
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

//counters and holders
let highScore = 0;
let gameRunning = false;
let lifes = totalLifes;
let splattedFlag = false;
let landedSafelyFlag = false;
let chutePulled = false;   // tracks when chute is pulled
let chuteFullyDeployed = false;  //happens fixed time after pulled
let chuteTimerSet = false;
let jumperInAir = false;    // Tracks when leaves plane
let windToloranceTimer = 9999999;  // counter (start large to invoke first wind)
let letGoOfJumpButton = false;    // checks for double push of jump via keyboard
let firstChutePull = true;  // checks for first verse subsquent attempts at deploying chute
let gameScoreAccumulator = 0;
let playerIpData = [];
const apiUrl = "https://5f8f6e13693e730016d7b12c.mockapi.io/parachute/HighScore";  //api
const ipAddressUrl = "https://api.ipdata.co?api-key=35d15246450fb408a65988c1716786efdb6e46661fe6da4e8b950a8d";  //ip address getter




//keyboard influance
const moveLeftKey = 37; //left arrow
const moveRightKey = 39; //left arrow
const jumpKey = 32;  // space bar
const goGameKey = 71;  // G
const resetKey = 82;  // R


// game pieces
let jumperGamePiece;
let paraChuteGamePieceGreen;
let paraChuteGamePieceYellow;
let planeGamePiece;
let landingPadGamePiece;
let ambulanceGamePiece;
let redCrossGamePiece;
let windowGamePiece;
let windSockW2;
let windSockW1;
let windSock0;
let windSockE1;
let windSockE2;
let roundScoreGamePiece;
let gameScoreGamePiece;
let splatMessage;
let lifesGamePiece;
let highScoreGamePiece;

function startGame() {
    //let num = (Math.random()*2).toFixed(2);
    //let num = ((Math.random()) - .5).toFixed(3)
    //let num = Math.floor(Math.random() * 5 ) - 2;
    //console.log (`Random Number: ${num}`);

    //setting up HTML
    gameButtonsDiv.style.visibility ="visible"; 
    headerDiv.style.visibility= "hidden";
    highScoreDiv.style.visibility = "hidden";
    restartGameDiv.style.visibility = "hidden";
    body1.scrollIntoView(true);

    //Game pieces
    planeGamePiece = new component(30, 15, "blue", 580, 10);
    jumperGamePiece = new component(20, 30, "red", 580, 10);
    paraChuteGamePieceGreen = new component(20, 6, "green", 580, 10);
    paraChuteGamePieceYellow = new component(20, 6, "yellow", 580, 10);
    ambulanceGamePiece = new component(35, 15, "yellow", 600, 380);
    redCrossGamePiece = new component("30px", "Consolas", "red", 600, 395, "+");
    windowGamePiece = new component(10, 10, "black", 600, 380);
    landingPadx = (Math.floor(Math.random() * 500 ))
    landingPadGamePiece = new component(60, 5, "green", landingPadx, 395);
    roundScoreGamePiece = new component("20px", "Consolas", "black", landingPadx, 380, "! GO !");
    gameScoreGamePiece = new component("15px", "Consolas", "black", 3, 15, `Score: ${gameScoreAccumulator}`);
    lifesGamePiece = new component("15px", "Consolas", "black", (canvasX/2 - 50), 15, `Lives: ${totalLifes}`);
    highScoreGamePiece = new component("15px", "Consolas", "black", (canvasX - 200), 15, `High Score: ${highScore}`);
    splatMessage = new component("120px", "Consolas", "red", (canvasX / 20), (canvasY /2), "!! Splat !!");
    windSockW2 = new component(40, 10, "red", 0, 340);
    windSockW1 = new component(20, 10, "violet", 20, 340);
    windSock0 = new component(3, 60, "violet", 40, 340);
    windSockE1 = new component(20, 10, "violet", 40, 340);
    windSockE2 = new component(40, 10, "red", 40, 340);

    getTenthHighScore();
  
    // get IP address info 
    let requestIp = new XMLHttpRequest();
    requestIp.open('GET', ipAddressUrl);
    requestIp.setRequestHeader('Accept', 'application/json');
    
    requestIp.onreadystatechange = function () {
      if (this.readyState === 4) {
        //console.log(this.responseText);
        stageHighScorePayload(this.responseText)
      }
    };
    
    requestIp.send();
    function stageHighScorePayload (data) {
        playerIpData = JSON.parse(data);
    }

    // start game
    myGameArea.start();
}

let myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = canvasX;
        this.canvas.height = canvasY;
        this.context = this.canvas.getContext("2d");
        this.canvas.id = "canvas1"
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        console.log (this.canvas);
        this.interval = setInterval(updateGameArea, screenUpdateInterval);
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
          })
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
                if (e.keyCode == jumpKey) {
                    letGoOfJumpButton = true;
                    //console.log (`let go of jump`);
                }
          })
        jumpButton.addEventListener('click', function() {
            letGoOfJumpButton = true;
            jump();
        })
        moveLeftButton.addEventListener('click', function() {
            moveLeft();
        })
        moveRightButton.addEventListener('click', function() {
            moveRight();
        })
        goGameButton.addEventListener('click', function() {
            goGame();
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

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
    this.splat = function() {
        var mybottom = this.y + (this.height) + (landingPadGamePiece.height - 1);
        let splatted = false;
        if (mybottom > canvasY) {
            splatted = true
        }
        return splatted;
    }
}

function updateGameArea() {
    
    if ( jumperInAir && !chutePulled && (jumperGamePiece.speedX <= 0 ) ) {  //plane only heads West
        jumperGamePiece.speedX += (planeInertiaInfluance / 2);     //slow down para from initial plane inertia 
        if (jumperGamePiece.speedX >= 0 ) {
            jumperGamePiece.speedX = 0;
        };
    }; 

    if ( jumperInAir && !chutePulled ) {
        
        if ( jumperGamePiece.y.between(   1, 150) ) {
            roundScoreGamePiece.text = scoreMatrix[1];
            roundScore = scoreMatrix[1];
            landingPadGamePiece.width = 60;
        }
        if ( jumperGamePiece.y.between( 151, 250) ) {
            roundScoreGamePiece.text = scoreMatrix[2];
            roundScore = scoreMatrix[2];
            landingPadGamePiece.width = 50;
        }
        if ( jumperGamePiece.y.between( 251, 300) ) {
            roundScoreGamePiece.text = scoreMatrix[3];
            roundScore = scoreMatrix[3];
            landingPadGamePiece.width = 40;
        }
        if ( jumperGamePiece.y.between( 301, 350) ) {
            roundScoreGamePiece.text = scoreMatrix[4];
            roundScore = scoreMatrix[4];
            landingPadGamePiece.width = 38;
        }
        if ( jumperGamePiece.y.between( 350, 400) ) {
            roundScoreGamePiece.text = scoreMatrix[5];
            roundScore = scoreMatrix[5];
            landingPadGamePiece.width = 36;
        };
    };
    
    if ( windToloranceTimer > windChangeRate ) {
        windCurrent = influanceWind(windCurrent);
        windToloranceTimer = 0;  //reset to start counting again
    }  //end of if
    windToloranceTimer += 1
    
    if ( chutePulled && !chuteFullyDeployed && !chuteTimerSet) {
        chuteDeploymentTimer = Date.now();
        chuteTimerSet = true;
    }
    
    if ( chutePulled && !chuteFullyDeployed && chuteTimerSet ) {
        if ((Date.now() - chuteDeploymentTimer) > chuteOpeningTime) {
            chuteFullyDeployed = true;
        }
    }

    
    if (myGameArea.key && myGameArea.key == moveLeftKey) { moveLeft()  }  // left arrow
    if (myGameArea.key && myGameArea.key == moveRightKey) { moveRight() }  //right arrow
    if (myGameArea.key && myGameArea.key == goGameKey) { goGame() }  //G for Go (fly plane)
    if (myGameArea.key && myGameArea.key == resetKey) { reset() }  //R for Reset
    if (myGameArea.key && myGameArea.key == jumpKey) { jump() }  //press space
    
        myGameArea.clear();
             
        gameScoreGamePiece.newPos();
        jumperGamePiece.newPos();
        planeGamePiece.newPos();
        landingPadGamePiece.newPos();
        ambulanceGamePiece.newPos();
        redCrossGamePiece.newPos();
        windowGamePiece.newPos();
        roundScoreGamePiece.newPos();
        lifesGamePiece.newPos();
        highScoreGamePiece.newPos();
        
        gameScoreGamePiece.update();
        jumperGamePiece.update();
        planeGamePiece.update();
        landingPadGamePiece.update();
        ambulanceGamePiece.update();
        redCrossGamePiece.update();
        windowGamePiece.update();
        roundScoreGamePiece.update();
        lifesGamePiece.update(); 
        highScoreGamePiece.update();
        
        if ( !splattedFlag && chuteFullyDeployed && jumperGamePiece.landedSafely(landingPadGamePiece)) {
            jumperInAir = false;
            landedSafelyFlag = true;
            jumperGamePiece.speedY = 0;
            jumperGamePiece.speedX = 0;
            splatMessage.text = 'Landed'
            splatMessage.newPos();
            splatMessage.update();
            truckPickup();
        } else if (!landedSafelyFlag && (jumperGamePiece.splat() || (!jumperInAir && planeGamePiece.x < -5 ))) {
            jumperInAir = false;
            splattedFlag = true;
            roundScore = 0;
            roundScoreGamePiece.x = landingPadGamePiece.x
            roundScoreGamePiece.text = " zero "
            roundScoreGamePiece.newPos();
            roundScoreGamePiece.update(); 
            if ( lifes > 1 ) {
                splatMessage.text = '!! Splat !!'                
            } else {
                splatMessage.text = "Game Over"
            };
            splatMessage.newPos();
            splatMessage.update();
            ambulancePickup()
        };

        if ( chutePulled && !chuteFullyDeployed ) {
            paraChuteGamePieceYellow.x = jumperGamePiece.x
            paraChuteGamePieceYellow.y = jumperGamePiece.y
            paraChuteGamePieceYellow.newPos();
            paraChuteGamePieceYellow.update();
        };

        if ( chuteFullyDeployed ) {
            paraChuteGamePieceGreen.x = jumperGamePiece.x
            paraChuteGamePieceGreen.y = jumperGamePiece.y
            paraChuteGamePieceGreen.newPos();
            paraChuteGamePieceGreen.update();
        };
    
    
    
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

function moveLeft() {
      if ( jumperInAir && chutePulled && !landedSafelyFlag ) {
        //windCurrent = -2                                                   // <----------    remove!!
        //  console.log (`entering switchL: ${jumperGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                jumperGamePiece.speedX += (-parachuteLRInfluance);
                if ( jumperGamePiece.speedX <= parachuteLRMax.west2Max ) {
                    jumperGamePiece.speedX = parachuteLRMax.west2Max;
                } 
                break;
            case -1:  // westwardly mild wind
                jumperGamePiece.speedX += (-parachuteLRInfluance);
                if ( jumperGamePiece.speedX <= parachuteLRMax.west1Max ) {
                    jumperGamePiece.speedX = parachuteLRMax.west1Max;
                } 
                break;
            case 0:   //no influance
                jumperGamePiece.speedX += -parachuteLRInfluance;
                if ( jumperGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    jumperGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                if (jumperGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        jumperGamePiece.speedX = parachuteLRMax.neutralE;
                };
                break;
            case 1:  // eastwardly mild wind
                jumperGamePiece.speedX += -(parachuteLRInfluance);
                if (jumperGamePiece.speedX <= parachuteLRMax.east1Min ) {
                        jumperGamePiece.speedX = parachuteLRMax.east1Min;
                };
                break;
            case 2:  // eastwardly strong wind
                jumperGamePiece.speedX += -(parachuteLRInfluance);
                if ( jumperGamePiece.speedX <= parachuteLRMax.east2Min ) {
                        jumperGamePiece.speedX = parachuteLRMax.east2Min;
                };
                break;
            default:
                console.log (`Error in Move Left Wind Case`);
                break;
           }  //end winfCurrent switch
    };  // end if jumperInAir and chutePulled
  } // end moveLeft fn
  
  function moveRight() {
    //windCurrent = -2                                                   // <----------    remove!!
    if ( jumperInAir && chutePulled && !landedSafelyFlag ) {
        //console.log (`entering switchR: ${jumperGamePiece.speedX} windCur: ${windCurrent}`);
        switch (windCurrent) {
            case -2:  // westwardly strong wind (negative numbers)
                jumperGamePiece.speedX += (parachuteLRInfluance);
                if ( jumperGamePiece.speedX >= parachuteLRMax.west2Min ) {
                    jumperGamePiece.speedX = parachuteLRMax.west2Min;
                };
                break;
            case -1:  // westwardly mild wind
                jumperGamePiece.speedX += (parachuteLRInfluance);
                if (jumperGamePiece.speedX >= parachuteLRMax.west1Min ) {
                        jumperGamePiece.speedX = parachuteLRMax.west1Min;
                };
                break;
            case 0:   //no influance
                jumperGamePiece.speedX += parachuteLRInfluance;
                if ( jumperGamePiece.speedX <= parachuteLRMax.neutralW ) {
                    jumperGamePiece.speedX = parachuteLRMax.neutralW;
                } 
                if (jumperGamePiece.speedX >= parachuteLRMax.neutralE ) {
                        jumperGamePiece.speedX = parachuteLRMax.neutralE;
                }; 
                break;
            case 1:  // eastwardly mild wind
                jumperGamePiece.speedX += (parachuteLRInfluance);
                if ( jumperGamePiece.speedX >= parachuteLRMax.east1Max ) {
                    jumperGamePiece.speedX = parachuteLRMax.east1Max;
                } 
                break;
            case 2:  // eastwardly strong wind
                jumperGamePiece.speedX += (parachuteLRInfluance);
                if ( jumperGamePiece.speedX >= parachuteLRMax.east2Max ) {
                    jumperGamePiece.speedX = parachuteLRMax.east2Max;
                } 
                break;
            default:
                console.log (`Error in Move Right Wind Case`);
                break;
           }  //end case
      }; // end if jumperInAir and chutePulled
  } //end moveRight fn

  
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
  
  function ambulancePickup() {
    ambulanceGamePiece.speedX -= .25;
    redCrossGamePiece.x = ambulanceGamePiece.x;
 if ( ambulanceGamePiece.x < 1 ) {
      reset()
  };
} 

  function truckPickup() {
        ambulanceGamePiece.speedX -= .25;
        windowGamePiece.x = ambulanceGamePiece.x - 10;
     if ( ambulanceGamePiece.x < 1 ) {
          reset()
      };
  } 

  function flyplane() {
        //let planeSpeed = -((Math.random()*2) +.5).toFixed(3);
        planeSpeed = -((Math.random() * (planeMaximumSpeed - planeMinimumSpeed))+ planeMinimumSpeed).toFixed(3)
        console.log (`PlaneSpeed`, planeSpeed);
        planeGamePiece.speedX = planeSpeed
        jumperGamePiece.x = planeGamePiece.x;
        jumperGamePiece.speedX = planeGamePiece.speedX;
  };

    function jump() {
        if ( jumperInAir && letGoOfJumpButton ) {
        chutePulled = true    // set w/ second push of button
        letGoOfJumpButton = false;
        };   
    
        if ( planeGamePiece.speedX < 0 ) jumperInAir = true;  // plane must be moving to set jumperInAir
         
        if  ( planeGamePiece.speedX < 0 && !chutePulled ) {
            jumperGamePiece.speedY = gravityFreeFall;
        }
        else if ( chutePulled && firstChutePull ) {
            jumperGamePiece.speedY = gravityChute;
            firstChutePull = false;
            switch (windCurrent) {
                case -2:
                    jumperGamePiece.speedX = parachuteLRMax.west2ChuteDefault
                    break;
                case -1:
                    jumperGamePiece.speedX = parachuteLRMax.west1ChuteDefault
                    break;
                case 0:
                    jumperGamePiece.speedX = parachuteLRMax.neutralChuteDefault
                    break;
                case 1:
                    jumperGamePiece.speedX = parachuteLRMax.east1ChuteDefault
                    break;
                case 2:
                    jumperGamePiece.speedX = parachuteLRMax.east2ChuteDefault
                    break;
                default:
                    console.log (`Error in firstChutePulled case stmt`);
            } // end firstPulledChute case
        }  
    };

    function goGame() {
        //gameOver();    //   <-----------------------REMOVE (used for testing)

        if ( lifes > 0 && !gameRunning ) {
            gameRunning = true;
            flyplane();
        }
    }
   
    function getTenthHighScore() {
        let apiData= [];
        let tenthBuffer= [];
        fetch (apiUrl)
            .then (response => {
                return response.json();
            })
            .then (apiData => {
                apiData.sort(function(a, b){
                    return b.score - a.score
                });
                let index = 9;
                if ( apiData.length < 10 ) index = (apiData.length - 1)
                setScore (apiData[index].score);  //needed due to async call to API
            });
    };

    function setScore(value) {   //needed due to async call to API
        highScore = value;
        highScoreGamePiece.text = `High Score: ${value}`;
        console.log (`highScore: ${value}`);
    };


    function updateLeaderboard() {               
        let apiData= [];
        const ul = document.getElementById('leaderBoardUl');
        fetch (apiUrl)
            .then (response => {
                return response.json();
            })
            .then (apiData => {
                let i=0;
                let bufferLeaderboard =[];
                const leaderBoardUl = document.getElementById("leaderBoardUl")
                for ( i=0; i< apiData.length; i += 1 ) {
                    bufferLeaderboard.push({initials: apiData[i].initials, score: apiData[i].score})
                }
                bufferLeaderboard.sort(function(a, b){
                    return b.score - a.score
                });
                
                let maxLength = 0;
                if (bufferLeaderboard.length > 10) {
                    maxLength = 10
                } else {
                    maxLength = bufferLeaderboard.length
                } 
                
                let html = "<table border='1|1'>";
                for (let i = 0; i < maxLength; i++) {
                    html+="<tr>";
                    html+="<td>"+bufferLeaderboard[i].initials+"</td>";
                    html+="<td>"+bufferLeaderboard[i].score+"</td>";
                    html+="</tr>";
                }
                html+="</table>";
                leaderBoardUl.innerHTML = html;


            });
        return apiData
        ;    
    };
    

    function reset() {
        if ( landedSafelyFlag ) {
            gameScoreAccumulator += roundScore
            Math.round (gameScoreAccumulator);
            gameScoreGamePiece.text = `Score: ${gameScoreAccumulator}`
        };
        if ( splattedFlag ) {
            lifes -= 1
            lifesGamePiece.text = `Lifes: ${lifes}`;
            if ( lifes < 1 ) {
                console.log (`Game Over`);
                gameOver (gameScoreAccumulator);
            }  //the end
        };
        landedSafelyFlag = false;
        splattedFlag = false;
        ambulanceGamePiece.x = 600;
        ambulanceGamePiece.speedX = 0;
        redCrossGamePiece.x = ambulanceGamePiece.x + 3;
        windowGamePiece.x = ambulanceGamePiece.x;
        planeGamePiece.x = 580;
        planeGamePiece.speedX = 0;
        jumperGamePiece.x = 580;
        jumperGamePiece.y = 10;
        jumperGamePiece.speedX = planeGamePiece.speedX;
        jumperGamePiece.speedY = 0;
        chutePulled = false;
        jumperInAir = false;
        landingPadx = (Math.floor(Math.random() * 500 ));
        landingPadGamePiece.width = 60;
        landingPadGamePiece.x = landingPadx;
        roundScoreGamePiece.x = landingPadx;
        roundScoreGamePiece.text = '! GO !';
        windCurrent = Math.floor(Math.random() * 5 ) - 2;
        letGoOfJumpButton = false;
        firstChutePull = true;
        chuteTimerSet = false;
        chuteFullyDeployed = false;

        if ( lifes > 0 ) flyplane();
        
    };

    function gameOver(gameScore) {
        
        //console.log (`In Game Over`);
        //gameScoreAccumulator = 1320;   //  <--------------- remove
        
        const scoreMessage = document.getElementById("scoreMessage");
        const captureInitialsButton = document.getElementById("captureInitialsButton");
        const restartGameButton = document.getElementById("restartGameButton");
        const highScoreDiv = document.getElementById("highScoreDiv");
        const leaderBoardUl = document.getElementById("leaderBoardUl");

        gameButtonsDiv.style.visibility = "hidden";
        headerDiv.style.visibility = "visible";
        highScoreDiv.style.visibility = "visible";
        restartGameDiv.style.visibility = "visible";

       
        updateLeaderboard();   //update the board via async API routine
        
     

        if (gameScoreAccumulator > highScore) {
            scoreMessage.textContent = `Holy Cow - ${gameScoreAccumulator} is a high score`; // Create a text element
            captureInitialsButton.style.visibility = "visible";
        }
        else {
            scoreMessage.textContent = `So sorry - score of ${gameScoreAccumulator} is too low for any honey`; // Create a text element 
            captureInitialsButton.style.visibility = "hidden";

        };

    };  //end of gameOver fn

    function grabInitials() {
        let maxLength = 3;
        let userData = false;
        while (userData == false || (userData != null && userData.length > maxLength)) {
        userData = window.prompt(`Please enter ${maxLength} initials (example: ABC)`);
        }
        if (userData == "" || userData.toUpperCase() == "ASS" ) {
            userData = "XXX";
        } 
        captureInitialsButton.style.visibility = "hidden";
        return userData.toUpperCase();
    }
    
    captureInitialsButton.addEventListener('click', function() {
        let initials = grabInitials()
        let highScorePayload = {initials: initials, score: gameScoreAccumulator, ipAddress: playerIpData.ip, city: playerIpData.city, region: playerIpData.region, asn: playerIpData.asn.name};
        //console.log (`payload: `, highScorePayload);
        postApi (highScorePayload);
    })
    
    async function postApi(data) {
        try {
            // Create request to api service
            const req = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                
                // format the data
                body: JSON.stringify({
                    initials: data.initials,
                    score: data.score,
                    ipAddress: data.ipAddress,
                    city: data.city,
                    region: data.region,
                    asn: data.asn
                }),
            });
            
            const res = await req.json();
            // Log success message
            //console.log(res);                
        } catch(err) {
            console.error(`ERROR: ${err}`);
        }
    };


    restartGameButton.addEventListener('click', function() {
        console.log (`restartGameButton button clicked`);
        location.reload()
    })