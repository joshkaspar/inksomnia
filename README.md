# XTeink X4 Sleep Screens

A collection of p5.js sketches for generating sleep-screen artwork for an XTeink X4 e-ink display, with Truchet and tile-system experiments.

## Sketches

- `other/p5-truchet-diagonal.js`: classic diagonal split square tiles (random 4-way rotation)
- `scripts/p5-truchet-diagonal-480x800.js`: diagonal split variant sized for 480x800
- `scripts/p5-truchet-arcs-480x800.js`: classic two-arc Truchet tiles
- `scripts/p5-10print-polygon-480x800.js`: "10 PRINT"-style thick slash polygons
- `scripts/p5-smith-tiles-480x800.js`: constrained checkerboard group placement

## Hex tile-set

- `other/p5-hex-tile-set.js`: labeled hex tile-set definitions
- `other/p5-hex-random-first-attempt.js`: first random hex tiling attempt
- `other/p5-hex-random-second-attempt.js`: second constrained hex tiling attempt
- `other/truchet_hex_rule_based_second_attempt.js`: rule-based hex placement attempt

## Examples

### Smith tiles

![Smith tiles example](examples/smith_tiles_480x800.bmp)

### 10 PRINT

![10 PRINT example](examples/truchet_10print_480x800.bmp)

### Arc tiles

![Arc tiles example](examples/truchet_arcs_c2480x800.bmp)

### Diagonal tiles

![Diagonal tiles example](examples/truchet_b480x800.bmp)

## Running a single sketch in the p5 web editor

1. Open `https://editor.p5js.org/`
2. Paste one sketch file into the editor
3. Run

## Export

Most sketches support:

- `R` to regenerate
- `S` to save a PNG
