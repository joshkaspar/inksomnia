// MODIFIED: Changed tileSize to fit the new canvas dimensions perfectly
const tileSize = 40;
const lightCol = "#ffffff";
const darkCol = "#1f1f1f";
const lineCol = "#d3d3d3";

function setup() {
  // MODIFIED: Changed canvas size to 480x800
  createCanvas(480, 800);
  noLoop(); // We only need to draw once
  rectMode(CENTER);
}

function draw() {
  background("#d9d9d9");

  const cols = floor(width / tileSize); // Will be 12
  const rows = floor(height / tileSize); // Will be 20

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      // Calculate the center of the current tile
      const x = gx * tileSize + tileSize / 2;
      const y = gy * tileSize + tileSize / 2;

      const rot = floor(random(4)); // 4 possible rotations

      push(); // Save the current drawing state
      translate(x, y); // Move the origin to the center of the tile
      rotate(rot * HALF_PI); // Rotate the grid
      drawDiagonalTile(tileSize);
      pop(); // Restore the original drawing state
    }
  }
}

function drawDiagonalTile(s) {
  const h = s / 2; // Half the size

  stroke(lineCol);
  strokeWeight(1);

  // Two triangles split by a diagonal line
  fill(lightCol);
  triangle(-h, -h, h, -h, -h, h);

  fill(darkCol);
  triangle(h, h, h, -h, -h, h);

  // Optional border to emphasize tile edges
  noFill();
  stroke("#999");
  rect(0, 0, s, s);
}

function keyPressed() {
  if (key === "r" || key === "R") {
    redraw(); // regenerate the pattern
  }
  if (key === "s" || key === "S") {
    // Give it a more descriptive name, including dimensions
    saveCanvas("truchet_480x800", "png");
  }
}
