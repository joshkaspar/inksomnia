const tileSize = 40; 
const lightCol = "#ffffff";
const darkCol = "#1f1f1f";
const lineCol = "#d3d3d3";

function saveBMP(filename) {
  const ctx = drawingContext;
  const c = ctx.canvas;
  const { width: w, height: h } = c;
  const src = ctx.getImageData(0, 0, w, h).data;

  const rowBytes = Math.ceil(w * 3 / 4) * 4;
  const imgSize = rowBytes * h;
  const buf = new ArrayBuffer(54 + imgSize);
  const v = new DataView(buf);
  const d = new Uint8Array(buf);

  v.setUint16(0, 0x424D);
  v.setUint32(2, 54 + imgSize, true);
  v.setUint32(10, 54, true);
  v.setUint32(14, 40, true);
  v.setInt32(18, w, true);
  v.setInt32(22, h, true);
  v.setUint16(26, 1, true);
  v.setUint16(28, 24, true);
  v.setUint32(34, imgSize, true);

  for (let y = 0; y < h; y++) {
    const sr = (h - 1 - y) * w * 4;
    const dr = 54 + y * rowBytes;
    for (let x = 0; x < w; x++) {
      const si = sr + x * 4, di = dr + x * 3;
      d[di] = src[si + 2];
      d[di + 1] = src[si + 1];
      d[di + 2] = src[si];
    }
  }

  const url = URL.createObjectURL(new Blob([buf], { type: 'image/bmp' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (filename || 'canvas') + '.bmp';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setup() {
  createCanvas(480, 800);
  noLoop();
  rectMode(CENTER);

  const btnStyle = `
    display: inline-block;
    margin: 8px 4px 0;
    padding: 12px 28px;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: #1f1f1f;
    color: #fff;
    touch-action: manipulation;
  `;

  const redrawBtn = createButton('Redraw');
  redrawBtn.attribute('style', btnStyle);
  redrawBtn.mousePressed(() => redraw());

  const saveBtn = createButton('Save BMP');
  saveBtn.attribute('style', btnStyle);
  saveBtn.mousePressed(() => saveBMP('truchet_diagonal'));
}

function draw() {
  background(lightCol);

  const cols = floor(width / tileSize);
  const rows = floor(height / tileSize);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = gx * tileSize + tileSize / 2;
      const y = gy * tileSize + tileSize / 2;

      const rot = floor(random(4));

      push();
      translate(x, y);
      rotate(rot * HALF_PI);
      drawDiagonalTile(tileSize);
      pop();
    }
  }
}

function drawDiagonalTile(s) {
  const h = s / 2;

  stroke(lineCol);
  strokeWeight(1);

  fill(lightCol);
  triangle(-h, -h, h, -h, -h, h);

  fill(darkCol);
  triangle(h, h, h, -h, -h, h);

  noFill();
  stroke(lineCol);
  rect(0, 0, s, s);
}
