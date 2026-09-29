import { BlurStyle, ClipOp, Skia, TileMode } from '@shopify/react-native-skia';
import type { SkCanvas } from '@shopify/react-native-skia';
import {
  AMOUNT_GLOW, CARD_GRADIENT, COLORS, COMPACT_SLOT, ORBIT_SLOT, PILL_GLOW,
  PROCESSING_MS, SCAN_GLOW_PATH, SCAN_GLOW_STYLE, SCAN_GLOWS, SHADOW_LAYERS,
} from '../design';
import { figmaShader, rgba } from './paint';
import { drawOrbits, drawSuccess, easeOut } from './orbit';

/** Plain numbers for one frame of the card (read from shared values by CardCanvas). */
export type SceneState = {
  now: number;
  x: number; y: number; w: number; h: number;
  scanMix: number; amountMix: number; pillMix: number; compactMix: number;
  procStart: number; successStart: number; disc: number; check: number;
};

const RADIUS = 50;
const glowPath = Skia.Path.MakeFromSVGString(SCAN_GLOW_PATH)!;

/** Draws the morphing card: shadow, Figma fills, glows, orbit and success. */
export function drawScene(canvas: SkCanvas, st: SceneState, scale: number) {
  'worklet';
  const { now, x, y, w, h } = st;
  canvas.save();
  canvas.scale(scale, scale);
  const cr = Math.min(RADIUS, h / 2);
  const rrect = Skia.RRectXY(Skia.XYWHRect(x, y, w, h), cr, cr);

  // Layered shadow, scaled to the card's current size
  const k = Math.min(1.3, Math.max(0.3, h / 272));
  for (let i = 0; i < SHADOW_LAYERS.length; i++) {
    const L = SHADOW_LAYERS[i];
    const f = L.scales ? k : 1;
    const sp = L.spread * f;
    const sh = Skia.Paint();
    sh.setColor(Float32Array.of(0, 0, 0, L.alpha));
    sh.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, L.sigma * f, false));
    const rr = Math.min(RADIUS, (h - 2 * -sp) / 2);
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(x - sp, y + L.dy * f - sp, w + 2 * sp, h + 2 * sp), rr, rr), sh);
  }

  canvas.save();
  canvas.clipRRect(rrect, ClipOp.Intersect, true);

  // Compact live activity is pure black so it reads as one piece with the island
  const base = Skia.Paint();
  const cm0 = st.compactMix;
  const bc = COLORS.card[0] * (1 - cm0);
  base.setColor(Float32Array.of(bc, bc, bc, 1));
  canvas.drawRRect(rrect, base);

  // Scan card: three blurred colour polygons (Group 1)
  const scanMix = st.scanMix;
  if (scanMix > 0.001) {
    const gp = Skia.Paint();
    gp.setAntiAlias(true);
    gp.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, SCAN_GLOW_STYLE.blurSigma, false));
    for (let i = 0; i < SCAN_GLOWS.length; i++) {
      const g = SCAN_GLOWS[i];
      gp.setColor(rgba(g.color, SCAN_GLOW_STYLE.opacity * scanMix));
      canvas.save();
      canvas.translate(x + g.x, y + g.y);
      canvas.rotate(-g.rot, 0, 0);
      canvas.drawPath(glowPath, gp);
      canvas.restore();
    }
  }

  // Amount card + pill share the Rectangle 2 linear gradient
  const gradMix = (1 - scanMix) * (1 - st.compactMix);
  if (gradMix > 0.001) {
    const lp = Skia.Paint();
    // compact pill: Figma lays the gradient over a 298pt box clipped to 288pt
    lp.setShader(figmaShader(CARD_GRADIENT, x, y, w + 10 * st.compactMix, h));
    lp.setAlphaf(CARD_GRADIENT.opacity * gradMix);
    canvas.drawRRect(rrect, lp);
  }

  // Amount glow behind the digits
  const amountMix = st.amountMix;
  if (amountMix > 0.001) {
    const ag = AMOUNT_GLOW;
    const p = Skia.Paint();
    p.setShader(figmaShader(ag.paint, ag.x, ag.y, ag.w, ag.h));
    p.setAlphaf(ag.paint.opacity * amountMix);
    p.setImageFilter(Skia.ImageFilter.MakeBlur(ag.blurSigma, ag.blurSigma, TileMode.Decal, null));
    canvas.drawRect(Skia.XYWHRect(ag.x, ag.y, ag.w, ag.h), p);
  }

  // Pill radial glow
  const pillMix = st.pillMix;
  if (pillMix > 0.001) {
    const pg = PILL_GLOW;
    const p = Skia.Paint();
    // Rectangle 7 is 374x100 on the pill and 302x37 on the compact pill: follow the card
    // The compact pill has no radial glow in the design, so it fades out there
    const gw = w, gh = h + 1 - st.compactMix;
    p.setShader(figmaShader(pg.paint, x, y, gw, gh));
    p.setAlphaf(pg.paint.opacity * pillMix * (1 - st.compactMix));
    p.setImageFilter(Skia.ImageFilter.MakeBlur(pg.blurSigma, pg.blurSigma, TileMode.Decal, null));
    canvas.drawRect(Skia.XYWHRect(x, y, gw, gh), p);
  }

  // Orbit → success in the 50pt slot
  const procStart = st.procStart;
  if (procStart >= 0) {
    // Slot glides from the 50pt pill slot to the 28pt compact slot
    const cm = st.compactMix;
    const W = ORBIT_SLOT.size + (COMPACT_SLOT.size - ORBIT_SLOT.size) * cm;
    const sx = ORBIT_SLOT.x + (COMPACT_SLOT.x - ORBIT_SLOT.x) * cm;
    const sy = ORBIT_SLOT.y + (COMPACT_SLOT.y - ORBIT_SLOT.y) * cm;
    const dur = PROCESSING_MS / 1000;
    const discR = W * 0.34;
    canvas.save();
    canvas.translate(x + sx, y + sy);
    const tt = (now - procStart) / 1000;
    const ss = st.successStart;
    if (ss < 0) {
      drawOrbits(canvas, W, tt, dur, pillMix, 0, discR);
    } else {
      const s = (now - ss) / 1000;
      const fade = 1 - Math.min(1, s / 0.28);
      if (fade > 0) drawOrbits(canvas, W, dur + s, dur, fade, easeOut(Math.min(1, s / 0.22)), discR);
      drawSuccess(canvas, W, s, st.disc, st.check, discR);
    }
    canvas.restore();
  }

  canvas.restore();
  canvas.restore();
}
