// Truchet train tracks — adapted from Roni Kaufman
// https://ronikaufman.github.io/

function setup() {
  createCanvas(480, 800);
  pixelDensity(1);
  noFill();
  stroke(0);
  strokeWeight(2);
  strokeCap(SQUARE);
  noLoop();

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
  saveBtn.mousePressed(() => saveBMP('train_tracks'));
}

function draw() {
  background(255);

  const s = 60; // tile size
  const u = s / 4; // track gauge
  const e = 3; // sleeper overhang

  for (let x = 0; x < width; x += s) {
    for (let y = 0; y < height; y += s) {
      push();
      translate(x + s / 2, y + s / 2);
      rotate(random([0, HALF_PI]));

      if (random() < 0.5) {
        // — curved track pair —
        arc(-s / 2, -s / 2, s - u, s - u, 0, HALF_PI);
        arc(-s / 2, -s / 2, s + u, s + u, 0, HALF_PI);
        arc(s / 2, s / 2, s - u, s - u, PI, PI + HALF_PI);
        arc(s / 2, s / 2, s + u, s + u, PI, PI + HALF_PI);

        // curved sleepers
        const thetaStep = PI / 14;
        for (let theta = 0; theta <= HALF_PI; theta += thetaStep) {
          const r1 = (s - u) / 2 - e;
          const r2 = (s + u) / 2 + e;
          line(-s / 2 + r1 * cos(theta), -s / 2 + r1 * sin(theta), -s / 2 + r2 * cos(theta), -s / 2 + r2 * sin(theta));
          line(s / 2 + r1 * cos(theta + PI), s / 2 + r1 * sin(theta + PI), s / 2 + r2 * cos(theta + PI), s / 2 + r2 * sin(theta + PI));
        }
      } else {
        // — straight horizontal track —
        line(-s / 2, -u / 2, s / 2, -u / 2);
        line(-s / 2, u / 2, s / 2, u / 2);

        // stub track top
        line(-u / 2, -s / 2, -u / 2, -s / 2 + u);
        line(u / 2, -s / 2, u / 2, -s / 2 + u);
        line(-u, -s / 2 + u, u, -s / 2 + u);

        // stub track bottom
        line(-u / 2, s / 2, -u / 2, s / 2 - u);
        line(u / 2, s / 2, u / 2, s / 2 - u);
        line(-u, s / 2 - u, u, s / 2 - u);

        // straight sleepers
        const step = u / 2;
        for (let z = -s / 2; z <= s / 2 + step; z += step) {
          line(z, -u / 2 - e, z, u / 2 + e);
          if (z < -s / 4 || z > s / 4) line(-u / 2 - e, z, u / 2 + e, z);
        }
      }

      pop();
    }
  }
}



function saveBMP(filename = "canvas") {
  const c =
    (typeof _renderer !== "undefined" && _renderer.canvas) ||
    (typeof drawingContext !== "undefined" && drawingContext.canvas);
  if (!c) {
    console.error("No p5 canvas found.");
    return;
  }

  const ctx = c.getContext("2d");
  const w = c.width,
    h = c.height;
  const src = ctx.getImageData(0, 0, w, h).data;
  const rowBytes = Math.ceil((w * 3) / 4) * 4;
  const imgSize = rowBytes * h;
  const buf = new ArrayBuffer(54 + imgSize);
  const view = new DataView(buf);
  const out = new Uint8Array(buf);

  view.setUint16(0, 0x424d);
  view.setUint32(2, 54 + imgSize, true);
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
      const si = srcRow + x * 4,
        di = dstRow + x * 3;
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
