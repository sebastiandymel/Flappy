import _ from "lodash";

const refresh_rate_ms = 50;
const bar_width = 50;
const bar_speed = 5;
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
var birdImage = null;
var backgroundImage = null;

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

  var gapSize = player_height * 3.5;

  // DRAW BARS
  for (var i = 0; i < bars.length; i++) {
    bars[i].x -= bar_speed;

    if (bars[i].x < -bar_width) {
      bars[i].x = canvas.width;
      bars[i].scored = false;
    }

    var x = bars[i].x;
    var y = 0;
    var height = canvas.height - bars[i].gap - gapSize;
    var width = bar_width;

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.rect(x, height + gapSize, width, bars[i].gap);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    var r1 = toRect(x, y, width, height);
    var r2 = toRect(x, height + gapSize, width, bars[i].gap);
    var playerR = playerRect();
    colision = colision || hasCollide(playerR, r1) || hasCollide(playerR, r2);

    if (!bars[i].scored && bars[i].x < player_center_x - player_height / 2) {
      bars[i].scored = true;
      scoreValue += 10;
    }
  }

  drawScore();

  // UPDATE PLAYER POSITION
  if (!colision) {
    if (isUp && player_y > player_height) {
      player_y -= player_speed * 5;
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
