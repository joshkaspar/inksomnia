// Pure black and white for e-ink displays
const bgColor = "#ffffff";
const fgColor = "#000000";

const tileSize = 40;

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
  background(bgColor);

  const cols = width / tileSize;
  const rows = height / tileSize;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = gx * tileSize;
      const y = gy * tileSize;

      push();
      translate(x, y); // Move origin to the tile's top-left corner
      draw10PrintPolygon(tileSize);
      pop();
    }
  }
}

/**
 * Draws the '10 PRINT' pattern using a filled hexagon
 * to create a 'fat' slash with pointed ends that meet the tile edges.
 */
function draw10PrintPolygon(s) {
  // The 'fatness' of the slash. This value is the inset from the corner.
  // A larger value makes a thinner slash. A good value is between 25-40% of tile size.
  const fatness = s * 0.35;

  noStroke();
  fill(fgColor);

  // Randomly choose one of the two slash orientations
  if (random(1) > 0.5) {
    // Draw a forward-slash: /
    // This is a hexagon defined by six vertices.
    beginShape();
    vertex(s - fatness, 0); // Top edge, left point
    vertex(s, 0); // Top-right corner
    vertex(s, fatness); // Right edge, top point
    vertex(fatness, s); // Bottom edge, right point
    vertex(0, s); // Bottom-left corner
    vertex(0, s - fatness); // Left edge, bottom point
    endShape(CLOSE);
  } else {
    // Draw a back-slash: \
    // This is the other hexagon.
    beginShape();
    vertex(0, fatness); // Left edge, top point
    vertex(0, 0); // Top-left corner
    vertex(fatness, 0); // Top edge, right point
    vertex(s, s - fatness); // Right edge, bottom point
    vertex(s, s); // Bottom-right corner
    vertex(s - fatness, s); // Bottom edge, left point
    endShape(CLOSE);
  }
}

function keyPressed() {
  if (key === "r" || key === "R" || keyCode === 32) {
    // Allow spacebar too
    redraw(); // Regenerate the maze
  }
  if (key === "s" || key === "S") {
    saveBMP("10print_e-ink");
  }
}
