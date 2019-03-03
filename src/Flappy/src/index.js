import _ from "lodash";

const refresh_rate_ms = 50;
const bar_width = 50;
const player_height = 60;
const player_speed = 6;

var canvas = null;
var scoreElement = null;
var scoreValue = 0;
var ctx = null;
var bars = [];
var player_y;
var isUp = false;
var colision = false;
var player_center_x = 100;
var bar_speed = 5;
var birdImage = null;
var backgroundImage = null;
var topBarImage = null;
var bottomBarImage = null;
var isJumping = false;
var jump_increment = 0;

topBarImage = new Image();
topBarImage.src = "bar1.png";

bottomBarImage = new Image();
bottomBarImage.src = "bar2.png";

birdImage = new Image();
birdImage.src = "bird_1.PNG";

backgroundImage = new Image();
backgroundImage.src = "background.png";

window.onload = load;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function load() {
  canvas = document.getElementById("canvas");
  canvas.focus();
  canvas.setAttribute("width", 800);
  canvas.setAttribute("height", 480);
  ctx = canvas.getContext("2d");
  scoreElement = document.getElementById("score");

  restart();
  setInterval(draw, refresh_rate_ms);
}

function restart() {
  var numberOfBarsPerScreen = 5;
  var offset = canvas.width / numberOfBarsPerScreen;

  for (var i = 0; i < numberOfBarsPerScreen; i++) {
    bars[i] = {
      x: offset * i + canvas.width / 2,
      gap: 30 * (i + 1),
      scored: false
    };
  }
  scoreValue = 0;
  player_y = 100;
  colision = false;
}

function draw() {
  if (colision) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isGameOverVisible = false;

  ctx.drawImage(backgroundImage, 0, 0);

  // DRAW BARS
  for (var i = 0; i < bars.length; i++) {
    bars[i].x -= bar_speed;
    var gapSize = player_height * 3.5;

    if (bars[i].x < -bar_width) {
      bars[i].x = canvas.width;
      bars[i].scored = false;
      gapSize = calculateGap();
    }

    var x = bars[i].x;
    var y = 0;
    var height = canvas.height - bars[i].gap - gapSize;
    var width = bar_width;

    ctx.drawImage(topBarImage, x, y, width, height);
    ctx.drawImage(bottomBarImage, x, height + gapSize, width, bars[i].gap);

    var r1 = toRect(x, y, width, height);
    var r2 = toRect(x, height + gapSize, width, bars[i].gap);
    var playerR = playerRect();
    colision = colision || hasCollide(playerR, r1) || hasCollide(playerR, r2);

    if (!bars[i].scored && bars[i].x < player_center_x - player_height / 2) {
      bars[i].scored = true;
      scoreValue += 10;
    }
  }

  updateSpeed();
  drawScore();

  // UPDATE PLAYER POSITION
  var increment = player_speed;
  if (!colision) {
    if (isJumping) {
      jump_increment += increment;
      player_y -= increment;
      if (jump_increment > player_speed *  8 || player_y < player_height) {
        isJumping = false;
        jump_increment = 0;
      }
    } else if (isUp && player_y > player_height) {
      isJumping = true;
    } else if (player_y < canvas.height - player_height) {
      player_y += player_speed;
    }
  }

  ctx.drawImage(
    birdImage,
    player_center_x - player_height / 2 - 12,
    player_y - player_height / 2
  );
}

var isGameOverVisible = false;
function drawGameOver() {
  if (isGameOverVisible) {
    return;
  }
  ctx.font = "75px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  isGameOverVisible = true;
}

function drawScore() {
  scoreElement.innerHTML = scoreValue;

  if (!colision) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + scoreValue, 20, canvas.height - 20);
  }
}

function keyDownHandler(e) {
  if (isKeyUp(e)) {
    isUp = true;
  }
  if (isEnter(e) && isGameOverVisible && colision) {
    restart();
  }
}

function keyUpHandler(e) {
  if (isKeyUp(e)) {
    isUp = false;
  }
}

const Keys = {
  Enter: 13,
  Space: 32
};

function isEnter(e) {
  if (e.keyCode == Keys.Enter) {
    return true;
  }
  return false;
}

function isKeyUp(e) {
  if (e.key == "W" || e.key == "w" || e.keyCode == Keys.Space) {
    return true;
  }
  return false;
}

function hasCollide(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function playerRect() {
  return toRect(
    player_center_x - player_height / 2,
    player_y - player_height / 2,
    player_height,
    player_height
  );
}

function toRect(x, y, width, height) {
  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height
  };
}

function updateSpeed() {
  if (scoreValue > 400) {
    bar_speed = 12;
  } else if (scoreValue > 300) {
    bar_speed = 10;
  } else if (scoreValue > 200) {
    bar_speed = 9;
  } else if (scoreValue > 150) {
    bar_speed = 8;
  } else if (scoreValue > 100) {
    bar_speed = 7;
  } else if (scoreValue > 50) {
    bar_speed = 6;
  }
}

function calculateGap() {
  var factor = 3.5;
  if (scoreValue > 50) {
    factor = 1;
  } else if (scoreValue > 250) {
    factor = 2;
  }
  return player_height * factor;
}
