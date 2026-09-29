import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Canvas, createPicture, PaintStyle, Picture, Skia } from '@shopify/react-native-skia';
import type { GradientPaint, RGBA } from '../design';
import { figmaShader, rgba } from '../skia/paint';

type Props = {
  w: number;
  h: number;
  r: number;
  base?: RGBA;
  gradient?: GradientPaint;
  stroke?: RGBA; // 1px inside stroke
  style?: ViewStyle;
};

/** A rounded rect painted with an exact Figma fill stack (solid base + gradient + inside stroke). */
export function FigmaRect({ w, h, r, base, gradient, stroke, style }: Props) {
  const picture = React.useMemo(
    () =>
      createPicture((canvas) => {
        const rr = Skia.RRectXY(Skia.XYWHRect(0, 0, w, h), r, r);
        if (base) {
          const p = Skia.Paint();
          p.setAntiAlias(true);
          p.setColor(rgba(base));
          canvas.drawRRect(rr, p);
        }
        if (gradient) {
          const p = Skia.Paint();
          p.setAntiAlias(true);
          p.setShader(figmaShader(gradient, 0, 0, w, h));
          p.setAlphaf(gradient.opacity);
          canvas.drawRRect(rr, p);
        }
        if (stroke) {
          const p = Skia.Paint();
          p.setAntiAlias(true);
          p.setStyle(PaintStyle.Stroke);
          p.setStrokeWidth(1);
          p.setColor(rgba(stroke));
          canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(0.5, 0.5, w - 1, h - 1), r - 0.5, r - 0.5), p);
        }
      }),
    [w, h, r, base, gradient, stroke],
  );
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width: w, height: h }, style]} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
