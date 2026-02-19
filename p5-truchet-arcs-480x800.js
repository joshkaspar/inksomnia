const tileSize = 40;
const lightCol = "#ffffff";
const darkCol = "#000000";

function setup() {
  createCanvas(480, 800);
  noLoop(); // We only need to draw once
}

function draw() {
  // Use the light color for the background for a seamless look
  background(lightCol);

  const cols = width / tileSize;
  const rows = height / tileSize;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      // Position is top-left corner of the tile
      const x = gx * tileSize;
      const y = gy * tileSize;

      push();
      translate(x, y); // Move origin to the tile's corner
      drawArcTile(tileSize);
      pop();
    }
  }
}

/**
 * Draws a Truchet tile with two arcs within a square of size 's'.
 * There are two possible orientations, chosen randomly.
 */
function drawArcTile(s) {
  noFill();
  stroke(darkCol);
  // A thicker stroke looks better for these arcs
  strokeWeight(s * 0.2); // Make stroke width proportional to tile size

  // p5.js arc() takes: x, y, width, height, startAngle, endAngle
  // [p5js.org]
  if (random(1) > 0.5) {
    // Orientation 1: Top-Left and Bottom-Right arcs
    arc(0, 0, s, s, 0, HALF_PI);
    arc(s, s, s, s, PI, PI + HALF_PI);
  } else {
    // Orientation 2: Top-Right and Bottom-Left arcs
    arc(s, 0, s, s, HALF_PI, PI);
    arc(0, s, s, s, PI + HALF_PI, TWO_PI);
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    redraw(); // Regenerate the pattern
  }
  if (key === "s" || key === "S") {
    saveCanvas("truchet_arcs_480x800", "png");
  }
}
