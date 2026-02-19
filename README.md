# Truchet Tile Experiments

A collection of p5.js sketches exploring square and hex-based Truchet-style tile systems.

## Sketches

- `p5-truchet-diagonal.js`: classic diagonal split square tiles (random 4-way rotation)
- `p5-truchet-diagonal-480x800.js`: diagonal split variant sized for 480x800
- `p5-truchet-arcs-480x800.js`: classic two-arc Truchet tiles
- `p5-10print-polygon-480x800.js`: "10 PRINT"-style thick slash polygons
- `p5-smith-tiles-480x800.js`: constrained checkerboard group placement
- `p5-hex-tile-set.js`: labeled hex tile-set definitions
- `p5-hex-random-first-attempt.js`: first random hex tiling attempt
- `p5-hex-random-second-attempt.js`: second constrained hex tiling attempt
- `truchet_480x800.js`: additional 480x800 sketch
- `truchet_classic_p5.js`: additional classic p5 sketch

## Run Locally

### Requirements

- A modern web browser
- Python 3 (for a tiny local web server)
- Internet access the first time (the runner loads p5.js from a CDN)

### Quick start

```bash
cd truchet-tile-experiments
python3 -m http.server 8000
```

Open:

`http://localhost:8000/index.html`

Then select a sketch from the dropdown and click **Load Sketch**.

Note: The loader reads filenames from `sketches.json`. If you add a new sketch file, add it to that list so it appears in the dropdown.

## Running a single sketch in the p5 web editor

1. Open `https://editor.p5js.org/`
2. Paste one sketch file into the editor
3. Run

## Export

Most sketches support:

- `R` to regenerate
- `S` to save a PNG
