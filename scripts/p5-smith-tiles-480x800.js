const tileSize = 40;

// Tiles that share edge signatures can't be adjacent,
// tiles from opposite groups always match
const GROUP_1 = ["A", "D"]; // black/white bg, arcs at TR+BL / TL+BR
const GROUP_2 = ["B", "C"]; // the complementary pair

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
  noLoop();
}

function draw() {
  background(255);

  const cols = floor(width / tileSize);
  const rows = floor(height / tileSize);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = gx * tileSize + tileSize / 2;
      const y = gy * tileSize + tileSize / 2;

      // Checkerboard guarantees every neighbor is from the other group
      const group = (gx + gy) % 2 === 0 ? GROUP_1 : GROUP_2;
      const type = random(group);

      push();
      translate(x, y);
      drawTile(tileSize, type);
      pop();
    }
  }
}

function drawTile(s, type) {
  const h = s / 2;

  //  A = white bg, black arcs at TR + BL
  //  B = white bg, black arcs at TL + BR
  //  C = black bg, white arcs at TR + BL  (inverted A)
  //  D = black bg, white arcs at TL + BR  (inverted B)
  let bg, fg, dir;
  switch (type) {
    case "A":
      bg = 255;
      fg = 0;
      dir = 1;
      break;
    case "B":
      bg = 255;
      fg = 0;
      dir = 2;
      break;
    case "C":
      bg = 0;
      fg = 255;
      dir = 1;
      break;
    case "D":
      bg = 0;
      fg = 255;
      dir = 2;
      break;
  }

  noStroke();

  // Tile background
  fill(bg);
  rectMode(CENTER);
  rect(0, 0, s, s);

  // Filled quarter-circle arcs at two diagonal corners
  fill(fg);
  if (dir === 1) {
    // Top-right corner + bottom-left corner
    arc(h, -h, s, s, HALF_PI, PI, PIE);
    arc(-h, h, s, s, -HALF_PI, 0, PIE);
  } else {
    // Top-left corner + bottom-right corner
    arc(-h, -h, s, s, 0, HALF_PI, PIE);
    arc(h, h, s, s, PI, PI + HALF_PI, PIE);
  }
}

function keyPressed() {
  if (key === "r" || key === "R") redraw();
  if (key === "s" || key === "S") saveBMP("smith_tiles");
}
