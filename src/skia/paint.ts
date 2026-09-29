import { Skia, TileMode } from '@shopify/react-native-skia';
import type { GradientPaint, RGBA } from '../design';

/**
 * Figma stores a gradient as a 2x3 transform T that maps normalized node
 * coordinates (0..1) into "gradient space", where a linear gradient runs
 * from (0, .5) to (1, .5) and a radial gradient is a unit circle at (.5,.5).
 * Skia wants the opposite (gradient space -> pixels), so we invert T and
 * scale it to the node's pixel box. Result is identical to Figma's render.
 */
export function figmaShader(p: GradientPaint, x: number, y: number, w: number, h: number) {
  'worklet';
  const a = p.gt[0][0], b = p.gt[0][1], c = p.gt[0][2];
  const d = p.gt[1][0], e = p.gt[1][1], f = p.gt[1][2];
  const det = a * e - b * d;
  const ia = e / det, ib = -b / det, id = -d / det, ie = a / det;
  const ic = -(ia * c + ib * f);
  const iff = -(id * c + ie * f);
  const m = Skia.Matrix([
    w * ia, w * ib, x + w * ic,
    h * id, h * ie, y + h * iff,
    0, 0, 1,
  ]);
  const colors = p.stops.map((s) => Float32Array.of(s.c[0], s.c[1], s.c[2], s.c[3]));
  const pos = p.stops.map((s) => s.pos);
  if (p.kind === 'linear') {
    return Skia.Shader.MakeLinearGradient({ x: 0, y: 0.5 }, { x: 1, y: 0.5 }, colors, pos, TileMode.Clamp, m);
  }
  return Skia.Shader.MakeRadialGradient({ x: 0.5, y: 0.5 }, 0.5, colors, pos, TileMode.Clamp, m);
}

export function rgba(c: RGBA, alphaMul = 1) {
  'worklet';
  return Float32Array.of(c[0], c[1], c[2], c[3] * alphaMul);
}
