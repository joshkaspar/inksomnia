const tileSize = 40;
const lightCol = "#ffffff";
const darkCol = "#000000";

function saveBMP(filename = "canvas") {
  const c =
    (typeof _renderer !== "undefined" && _renderer.canvas) ||
    (typeof drawingContext !== "undefined" && drawingContext.canvas);

  if (!c) {
    console.error("No p5 canvas found.");
    return;
  }

  const ctx = c.getContext("2d");
  const w = c.width;
  const h = c.height;
  const src = ctx.getImageData(0, 0, w, h).data;

  const rowBytes = Math.ceil((w * 3) / 4) * 4;
  const imgSize = rowBytes * h;
  const fileSize = 54 + imgSize;

  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);
  const out = new Uint8Array(buf);

  view.setUint16(0, 0x424d, true);
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  view.setUint32(14, 40, true);
  view.setInt32(18, w, true);
  view.setInt32(22, h, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, imgSize, true);
  view.setInt32(38, 0, true);
  view.setInt32(42, 0, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  for (let y = 0; y < h; y++) {
    const srcRow = (h - 1 - y) * w * 4;
    const dstRow = 54 + y * rowBytes;
    for (let x = 0; x < w; x++) {
      const si = srcRow + x * 4;
      const di = dstRow + x * 3;
      out[di] = src[si + 2];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si];
    }
  }

  const blob = new Blob([buf], { type: "image/bmp" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".bmp") ? filename : `${filename}.bmp`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
    saveBMP("truchet_arcs_480x800");
  }
}
