// Noise-based contour map — 480×800 e-ink

const STEP        = 4;    // (4) grid sample spacing in pixels
const OCTAVES     = 3;    // (3) layers of noise - 4 is smooth/simple, 8 is detailed/complex
const LACUNARITY  = 2;  // (2) detail at each level. 2 = 2x zoom at each layer
const PERSISTENCE = 0.4;  // (0.55) how much the amplitude multiplies each octave.
const NUM_LEVELS  = 12;   // (12) number of contour isolines
const WARP_AMT    = 70;  // (70) domain-warp strength in pixels
const MAJOR_EVERY = 5;    // (5) thicker stroke every N levels

let seed, grid, cols, rows;

function saveBMP(filename = "canvas") {
  const c =
    (typeof _renderer !== "undefined" && _renderer.canvas) ||
    (typeof drawingContext !== "undefined" && drawingContext.canvas);
  if (!c) { console.error("No p5 canvas found."); return; }

  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;
  const src = ctx.getImageData(0, 0, w, h).data;
  const rowBytes = Math.ceil((w * 3) / 4) * 4;
  const imgSize  = rowBytes * h;
  const fileSize = 54 + imgSize;

  const buf  = new ArrayBuffer(fileSize);
  const view = new DataView(buf);
  const out  = new Uint8Array(buf);

  view.setUint16(0,  0x424d);
  view.setUint32(2,  fileSize, true);
  view.setUint32(6,  0, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32 (18, w, true);
  view.setInt32 (22, h, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, imgSize, true);
  view.setInt32 (38, 0, true);
  view.setInt32 (42, 0, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  for (let y = 0; y < h; y++) {
    const srcRow = (h - 1 - y) * w * 4;
    const dstRow = 54 + y * rowBytes;
    for (let x = 0; x < w; x++) {
      const si = srcRow + x * 4, di = dstRow + x * 3;
      out[di]     = src[si + 2];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si];
    }
  }

  const blob = new Blob([buf], { type: "image/bmp" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename.endsWith(".bmp") ? filename : `${filename}.bmp`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setup() {
  createCanvas(480, 800);
  noLoop();

  generate();

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

  const redrawBtn = createButton("Redraw");
  redrawBtn.attribute("style", btnStyle);
  redrawBtn.mousePressed(() => { generate(); redraw(); });

  const saveBtn = createButton("Save BMP");
  saveBtn.attribute("style", btnStyle);
  saveBtn.mousePressed(() => saveBMP("contour"));
}


// ── Height field ────────────────────────────────────────────────────────────

function generate() {
  seed = floor(random(100000));
  noiseSeed(seed);
  randomSeed(seed);

  cols = floor(width  / STEP) + 1;
  rows = floor(height / STEP) + 1;

  grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = new Float32Array(cols);
    for (let c = 0; c < cols; c++) {
      grid[r][c] = heightAt(c * STEP, r * STEP);
    }
  }
}

function fbm(x, y) {
  let val = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < OCTAVES; i++) {
    val  += amp * noise(x * freq, y * freq);
    norm += amp;
    amp  *= PERSISTENCE;
    freq *= LACUNARITY;
  }
  return val / norm;
}

function heightAt(wx, wy) {
  // Domain warp: offset sample coords with a second noise field
  const dx = (fbm(wx * 0.003 + 5.2, wy * 0.0015 + 1.3) - 0.5) * 2 * WARP_AMT;
  const dy = (fbm(wx * 0.003 + 9.8, wy * 0.0015 + 2.7) - 0.5) * 2 * WARP_AMT;

  // fBm with portrait-axis bias and domain warp applied
  return fbm((wx + dx) * 0.004, (wy + dy) * 0.002);
}


// ── Rendering ────────────────────────────────────────────────────────────────

function draw() {
  background(255);
  noFill();
  stroke(0);

  for (let level = 0; level < NUM_LEVELS; level++) {
    const iso = map(level, 0, NUM_LEVELS, 0.30, 0.70);
    strokeWeight(level % MAJOR_EVERY === 0 ? 1.5 : 0.75);
    marchContour(iso);
  }

  // Seed label — small, faint, bottom-right corner
  noStroke();
  fill(180);
  textFont("monospace");
  textSize(9);
  textAlign(RIGHT, BOTTOM);
  text(`#${seed}`, width - 8, height - 8);
}

// ── Marching squares ─────────────────────────────────────────────────────────

// Linearly interpolate a crossing point on the edge from (ax,ay,v0) to (bx,by,v1).
function interpEdge(v0, v1, ax, ay, bx, by, iso) {
  if (abs(v1 - v0) < 1e-10) return [(ax + bx) * 0.5, (ay + by) * 0.5];
  const t = (iso - v0) / (v1 - v0);
  return [ax + t * (bx - ax), ay + t * (by - ay)];
}


function marchContour(iso) {
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const x  = c * STEP,  y  = r * STEP;
      const xs = x + STEP,  ys = y + STEP;

      const tl = grid[r    ][c    ];
      const tr = grid[r    ][c + 1];
      const br = grid[r + 1][c + 1];
      const bl = grid[r + 1][c    ];

      // Bitmask: TL=8, TR=4, BR=2, BL=1
      const idx = (tl > iso ? 8 : 0) |
                  (tr > iso ? 4 : 0) |
                  (br > iso ? 2 : 0) |
                  (bl > iso ? 1 : 0);

      if (idx === 0 || idx === 15) continue;

      // Lazy edge-crossing point helpers (only computed when referenced)
      const T = () => interpEdge(tl, tr, x,  y,  xs, y,  iso);
      const R = () => interpEdge(tr, br, xs, y,  xs, ys, iso);
      const B = () => interpEdge(bl, br, x,  ys, xs, ys, iso);
      const L = () => interpEdge(tl, bl, x,  y,  x,  ys, iso);

      const seg = (a, b) => line(a[0], a[1], b[0], b[1]);

      switch (idx) {
        case  1: seg(L(), B()); break;
        case  2: seg(B(), R()); break;
        case  3: seg(L(), R()); break;
        case  4: seg(T(), R()); break;
        case  5: seg(T(), R()); seg(L(), B()); break; // saddle: TR + BL isolated
        case  6: seg(T(), B()); break;
        case  7: seg(T(), L()); break;
        case  8: seg(T(), L()); break;
        case  9: seg(T(), B()); break;
        case 10: seg(T(), L()); seg(R(), B()); break; // saddle: TL + BR isolated
        case 11: seg(T(), R()); break;
        case 12: seg(L(), R()); break;
        case 13: seg(R(), B()); break;
        case 14: seg(L(), B()); break;
      }
    }
  }
}


