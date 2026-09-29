// Every value in this file was read directly from the Figma file
// (fP9BiA66O4UVq6PEBufn1g) through the Figma API, not eyeballed.
// Coordinates are in Figma's 402pt-wide iPhone 17 frame space.

export type RGBA = [number, number, number, number];
export type Stop = { pos: number; c: RGBA };
// Figma gradientTransform: maps normalized node space (0..1) into gradient space
export type GT = [[number, number, number], [number, number, number]];
export type LinearPaint = { kind: 'linear'; stops: Stop[]; gt: GT; opacity: number };
export type RadialPaint = { kind: 'radial'; stops: Stop[]; gt: GT; opacity: number };
export type GradientPaint = LinearPaint | RadialPaint;

export const DESIGN_WIDTH = 402;

export const COLORS = {
  screen: '#E6E6E6',
  card: [0.028846, 0.028846, 0.028846, 1] as RGBA, // #070707
  closeBtn: '#1C1C1E',
  payDisabledBg: [0.1725, 0.1725, 0.1804, 1] as RGBA, // #2C2C2E
  payDisabledText: '#8E8E93',
  payText: '#252C30',
  bankStroke: '#2C2C2C',
  subText: '#A1A1AA',
  scanCorner: '#FFE479',
  success: [48 / 255, 209 / 255, 88 / 255, 1] as RGBA,
};

// Layered "organic" shadow. Figma's single DROP_SHADOW (0,29 · blur 31.7 · 25%) reads
// hard on a real screen, so it's split into a tight contact shadow plus progressively
// softer, wider, fainter layers (the way real light falls off). Offsets and blur scale
// with the card's height, so the small pill casts a small shadow.
export const SHADOW_LAYERS = [
  { dy: 1, sigma: 1.5, alpha: 0.14, spread: 0, scales: false },
  { dy: 6, sigma: 8, alpha: 0.1, spread: -2, scales: true },
  { dy: 18, sigma: 20, alpha: 0.1, spread: -8, scales: true },
  { dy: 34, sigma: 40, alpha: 0.09, spread: -16, scales: true },
];

// Geometry of the morphing card in each state (frame coordinates)
export const CARD = {
  scan: { x: 15, y: 10, w: 372, h: 373, r: 50 },
  amount: { x: 14, y: 14, w: 374, h: 272, r: 50 },
  pill: { x: 14, y: 14, w: 374, h: 99, r: 50 },
  // iPhone 17 - 7: compact live-activity pill wrapped around the Dynamic Island
  compact: { x: 52, y: 14, w: 288, h: 37, r: 18.5 },
};

// Scan viewfinder (Rectangle 3), as drawn in Figma. On the phone its top is pushed down just
// enough to clear the real Dynamic Island (see islandClearance below); the bottom edge stays put.
export const VIEWFINDER = { x: 8, y: 37, w: 356, h: 328, r: 46 };

// Dynamic Island geometry, derived from the device's safe-area inset. On island iPhones the
// island's bottom edge sits ~11pt above the safe-area line (59pt inset → 48, 62pt inset → 51).
export const ISLAND = { bottomAboveSafeArea: 11, gap: 4 };
// Extra nudge if you ever want more breathing room under the island
export const EXTRA_ISLAND_CLEARANCE = 0;

// Rectangle 2 fill (amount card and pill share this paint definition)
export const CARD_GRADIENT: LinearPaint = {
  kind: 'linear',
  opacity: 0.2,
  stops: [
    { pos: 0, c: [1, 0.903, 0.168, 1] },
    { pos: 0.5507, c: [0.192, 0.637, 1, 0.449] },
    { pos: 1, c: [0.098, 0.057, 0.663, 0] },
  ],
  gt: [
    [-0.1841, -1.2807, 1.9537],
    [1.5699, -0.1841, -1.0386],
  ],
};

// Amount glow — Rectangle 7 (260x63 at 92,113), layer blur 79.86
const AMOUNT_STOPS: Stop[] = [
  { pos: 0, c: [1, 0.946, 0.346, 0.66] },
  { pos: 0.4808, c: [0.169, 0.383, 0.678, 0.555] },
  { pos: 0.9215, c: [0.192, 0.637, 1, 0.449] },
  { pos: 1, c: [0.098, 0.057, 0.663, 0] },
];
export const AMOUNT_GLOW = {
  x: 92, y: 113, w: 260, h: 63,
  blurSigma: 79.855 / 2,
  paint: { kind: 'linear', opacity: 0.4, stops: AMOUNT_STOPS, gt: [[1, 0, 0], [0, 0.2433, 0.3846]] } as LinearPaint,
};
// Same gradient laid over the white amount digits at 50%
export const AMOUNT_TEXT_GRADIENT: LinearPaint = {
  kind: 'linear', opacity: 0.5, stops: AMOUNT_STOPS, gt: [[1, 0, 0], [0, 0.2433, 0.3846]],
};

// Pill radial glow — Rectangle 7 (374x100), layer blur 79.86
export const PILL_GLOW = {
  w: 374, h: 100,
  blurSigma: 79.855 / 2,
  paint: {
    kind: 'radial',
    opacity: 0.2,
    stops: [
      { pos: 0, c: [1, 0.946, 0.346, 0.66] },
      { pos: 0.5, c: [0.095, 0.082, 0.471, 0.83] },
      { pos: 1, c: [0, 0, 0, 1] },
    ],
    gt: [[0.4464, -0.155, 0.6106], [0.5274, 0.1086, 0.2821]],
  } as RadialPaint,
};

// Scan card background glows (Group 1). Blurred polygons, 28% opacity, blur 60.9
export const SCAN_GLOW_PATH = 'M 26 31 L 88 31 L 123 0 L 181.5 64.5 L 80.5 124.5 L 0 64.5 L 26 31 Z';
export const SCAN_GLOWS = [
  { x: -28, y: 135.8733, rot: 11.4912, color: [1, 1, 0.4745, 1] as RGBA },
  { x: 116.825, y: 71, rot: -18.6195, color: [0.5673, 0.8053, 1, 1] as RGBA },
  { x: 351.3307, y: 269.1401, rot: 156.6308, color: [1, 0.7885, 0.2067, 1] as RGBA },
];
export const SCAN_GLOW_STYLE = { opacity: 0.28, blurSigma: 60.9 / 2 };

// Buttons
export const PAY_BUTTON = {
  x: 226, y: 212, w: 138, h: 58, r: 44,
  gradient: {
    kind: 'linear', opacity: 1,
    stops: [{ pos: 0, c: [1, 0.655, 0.024, 1] }, { pos: 1, c: [1, 1, 1, 1] }],
    gt: [[0, 0.3663, 0.6337], [-6.9895, 0, 3.9947]],
  } as LinearPaint,
};
export const BANK_BUTTON = {
  x: 30, y: 212, w: 184, h: 58, r: 43,
  gradient: {
    kind: 'linear', opacity: 1,
    stops: [{ pos: 0, c: [0.063, 0.082, 0.082, 1] }, { pos: 1, c: [0.035, 0.063, 0.094, 1] }],
    gt: [[0, 1, 0], [-1, 0, 1]],
  } as LinearPaint,
  base: [0.1098, 0.1098, 0.1176, 1] as RGBA,
};

// Caret: Line 1, 63 long, 4 stroke, rotated so the gradient runs top → bottom
export const CARET = {
  y: 113, h: 63, w: 4,
  // typing state (7:263): blue → pale yellow → mint
  colors: ['rgb(91,137,255)', 'rgb(255,244,164)', 'rgb(81,255,206)'] as const,
  // empty state (5:151): blue → yellow → orange
  emptyColors: ['rgb(91,137,255)', 'rgb(255,230,43)', 'rgb(255,157,0)'] as const,
  locations: [0, 0.4773, 1] as const,
  // centre x when empty / gap after the last digit (from both Figma states)
  emptyX: 92.29,
  gapAfterText: 11,
};

export const RUPEE_X = 38;
export const AMOUNT_TEXT_X = 99;

// Orbit / success slot inside the pill
export const ORBIT_SLOT = { x: 16, y: 25, size: 50 };
// Success mark slot in the compact pill (Mask group, 28x28 at 7,5)
export const COMPACT_SLOT = { x: 7, y: 5, size: 28 };

// Processing time before the success state (1.5–2s requested)
export const PROCESSING_MS = 1800;
// How long the full "Paid" pill stays before tucking into the compact pill
export const PAID_HOLD_MS = 1400;
