import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, createPicture, Picture } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { drawScene } from '../skia/scene';

export type CardAnim = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  scanMix: SharedValue<number>;
  amountMix: SharedValue<number>;
  pillMix: SharedValue<number>;
  compactMix: SharedValue<number>; // 0 = big pill, 1 = compact pill
  procStart: SharedValue<number>; // clock ms, -1 = idle
  successStart: SharedValue<number>; // clock ms, -1 = not yet
  disc: SharedValue<number>;
  check: SharedValue<number>;
};

type Props = { anim: CardAnim; clock: SharedValue<number>; scale: number; height: number };

const styles = StyleSheet.create({ canvas: { position: 'absolute', left: 0, top: 0, right: 0 } });

export function CardCanvas({ anim, clock, scale, height }: Props) {
  const picture = useDerivedValue(() => {
    const st = {
      now: clock.value,
      x: anim.x.value, y: anim.y.value, w: anim.w.value, h: anim.h.value,
      scanMix: anim.scanMix.value, amountMix: anim.amountMix.value,
      pillMix: anim.pillMix.value, compactMix: anim.compactMix.value,
      procStart: anim.procStart.value, successStart: anim.successStart.value,
      disc: anim.disc.value, check: anim.check.value,
    };
    return createPicture((canvas) => drawScene(canvas, st, scale));
  });

  return (
    <Canvas style={[styles.canvas, { height }]} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
}
