import { BlendMode, BlurStyle, PaintStyle, Skia, StrokeCap, StrokeJoin, TileMode } from '@shopify/react-native-skia';
import type { SkCanvas } from '@shopify/react-native-skia';

// Same model as the web prototype: three orbits (you, bank, merchant) start
// tilted in different planes and fall into one plane while their points converge.

const TAU = Math.PI * 2;
const RINGS = [
  { tilt: 1.2, yaw: 0, col: [100 / 255, 210 / 255, 1] },
  { tilt: 1.2, yaw: 2.094, col: [191 / 255, 120 / 255, 1] },
  { tilt: 1.2, yaw: 4.189, col: [1, 1, 1] },
];

function clamp(v: number, a = 0, b = 1) {
  'worklet';
  return Math.min(b, Math.max(a, v));
}
function lerp(a: number, b: number, t: number) {
  'worklet';
  return a + (b - a) * t;
}
function easeInOut(t: number) {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
export function easeOut(t: number) {
  'worklet';
  return 1 - Math.pow(1 - t, 3);
}

function geom(tt: number, dur: number) {
  'worklet';
  const a = easeInOut(clamp(tt / (dur * 0.92)));
  return {
    a,
    phi: (1 - a) * 0.55 * Math.sin(tt * 2.2),
    base: 5.2 * tt + 1.6 * tt * tt,
    wob: 1 - a,
  };
}

function project(i: number, theta: number, a: number, phi: number, R: number, W: number) {
  'worklet';
  const r = RINGS[i];
  const tilt = lerp(r.tilt, 0, a);
  const x = Math.cos(theta) * R;
  const y = Math.sin(theta) * R;
  const y1 = y * Math.cos(tilt);
  const z1 = y * Math.sin(tilt);
  const cy = Math.cos(r.yaw), sy = Math.sin(r.yaw);
  const x2 = x * cy - y1 * sy;
  const y2 = x * sy + y1 * cy;
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const x3 = x2 * cp + z1 * sp;
  const z3 = -x2 * sp + z1 * cp;
  const F = R * 3.2;
  const s = F / (F + z3);
  return { x: W / 2 + x3 * s, y: W / 2 + y2 * s, z: z3 / R };
}

/** Draws the orbit system into a W×W box at the canvas origin. */
export function drawOrbits(canvas: SkCanvas, W: number, tt: number, dur: number, alpha: number, Rmix: number, discR: number) {
  'worklet';
  if (alpha <= 0.001) return;
  const g = geom(tt, dur);
  // Strokes are thickened at small sizes so the 50pt slot still reads on a retina screen
  const S = Math.max(W / 230, 0.42);
  const R0 = W * 0.36;
  const R = lerp(R0 * (1 - 0.05 * Math.sin(tt * 7) * g.wob), discR, Rmix);

  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setBlendMode(BlendMode.Plus);

  // Ring paths, brighter on the near side
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(1.2 * S);
  const SEG = 64;
  for (let i = 0; i < 3; i++) {
    const col = RINGS[i].col;
    let prev = project(i, 0, g.a, g.phi, R, W);
    for (let k = 1; k <= SEG; k++) {
      const p = project(i, (k / SEG) * TAU, g.a, g.phi, R, W);
      const depth = clamp(0.5 - (p.z + prev.z) / 4);
      paint.setColor(Float32Array.of(col[0], col[1], col[2], (0.05 + 0.22 * depth) * alpha));
      canvas.drawLine(prev.x, prev.y, p.x, p.y, paint);
      prev = p;
    }
  }

  // Points with comet tails
  paint.setStyle(PaintStyle.Fill);
  const glowPaint = Skia.Paint();
  glowPaint.setAntiAlias(true);
  glowPaint.setBlendMode(BlendMode.Plus);
  glowPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 6 * S, false));
  for (let i = 0; i < 3; i++) {
    const col = RINGS[i].col;
    for (let k = 16; k >= 0; k--) {
      const past = Math.max(0, tt - k * 0.012);
      const gp = geom(past, dur);
      const theta = gp.base - RINGS[i].yaw * gp.a - Math.PI / 2;
      const p = project(i, theta, gp.a, gp.phi, R, W);
      const f = 1 - k / 17;
      const size = (1.2 + 2.6 * f) * (0.8 + 0.4 * clamp(0.5 - p.z / 2)) * S;
      paint.setColor(Float32Array.of(col[0], col[1], col[2], 0.85 * f * f * alpha));
      canvas.drawCircle(p.x, p.y, size, paint);
      if (k === 0) {
        glowPaint.setColor(Float32Array.of(col[0], col[1], col[2], 0.55 * alpha));
        canvas.drawCircle(p.x, p.y, 7 * S, glowPaint);
      }
    }
  }

  // Core glow builds as the three parties align
  const core = Skia.Paint();
  core.setBlendMode(BlendMode.Plus);
  core.setShader(
    Skia.Shader.MakeRadialGradient(
      { x: W / 2, y: W / 2 }, R,
      [Float32Array.of(120 / 255, 190 / 255, 1, (0.04 + 0.12 * g.a) * alpha), Float32Array.of(120 / 255, 190 / 255, 1, 0)],
      null, TileMode.Clamp,
    ),
  );
  canvas.drawCircle(W / 2, W / 2, R, core);
}

const GREEN = [48 / 255, 209 / 255, 88 / 255];

/** Success mark: spring disc, ripple and self-drawing check. `s` = seconds since success. */
export function drawSuccess(canvas: SkCanvas, W: number, s: number, disc: number, check: number, discR: number) {
  'worklet';
  const S = Math.max(W / 230, 0.42);
  const sc = Math.max(0, disc);
  const cx = W / 2, cy = W / 2;
  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  if (s < 1) {
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth((2 * (1 - s) + 0.5) * S * 1.6);
    paint.setColor(Float32Array.of(GREEN[0], GREEN[1], GREEN[2], 0.5 * (1 - s)));
    canvas.drawCircle(cx, cy, discR * (1 + 0.75 * easeOut(s)), paint);
  }

  const halo = Skia.Paint();
  halo.setAntiAlias(true);
  halo.setColor(Float32Array.of(GREEN[0], GREEN[1], GREEN[2], 0.55 * clamp(sc)));
  halo.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 10 * S * 2, false));
  canvas.drawCircle(cx, cy, discR * sc, halo);

  paint.setStyle(PaintStyle.Fill);
  paint.setColor(Float32Array.of(GREEN[0], GREEN[1], GREEN[2], 1));
  canvas.drawCircle(cx, cy, discR * sc, paint);

  const p = clamp(check);
  if (p > 0) {
    const r = discR * sc;
    const pts = [[-0.4, 0.02], [-0.12, 0.3], [0.42, -0.26]].map(([x, y]) => [cx + x * r, cy + y * r]);
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    const len = p * (l1 + l2);
    const pb = Skia.PathBuilder.Make();
    pb.moveTo(pts[0][0], pts[0][1]);
    if (len <= l1) {
      const f = len / l1;
      pb.lineTo(lerp(pts[0][0], pts[1][0], f), lerp(pts[0][1], pts[1][1], f));
    } else {
      pb.lineTo(pts[1][0], pts[1][1]);
      const f = (len - l1) / l2;
      pb.lineTo(lerp(pts[1][0], pts[2][0], f), lerp(pts[1][1], pts[2][1], f));
    }
    const path = pb.build();
    const ck = Skia.Paint();
    ck.setAntiAlias(true);
    ck.setStyle(PaintStyle.Stroke);
    ck.setStrokeCap(StrokeCap.Round);
    ck.setStrokeJoin(StrokeJoin.Round);
    ck.setStrokeWidth(Math.max(1.5, r * 0.14));
    ck.setColor(Float32Array.of(1, 1, 1, 1));
    canvas.drawPath(path, ck);
  }
}
