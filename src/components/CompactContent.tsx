import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { CARD } from '../design';
import { F } from '../fonts';

type Props = { mix: SharedValue<number>; active: boolean; amount: string; onReset: () => void };

const C = CARD.compact;

/** iPhone 17 - 7: "Paid ··· island ··· ₹240" wrapped around the Dynamic Island. */
export function CompactContent({ mix, active, amount, onReset }: Props) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(mix.value, [0.45, 1], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(mix.value, [0, 1], [0.92, 1]) }],
  }));
  return (
    <Animated.View style={[styles.box, style]} pointerEvents={active ? 'auto' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onReset} accessibilityLabel={`Paid ₹${amount}. Tap to scan again`}>
        <Text style={styles.paid}>Paid</Text>
        <Text style={styles.amount}>₹{amount}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', left: C.x, top: C.y, width: C.w, height: C.h },
  paid: { position: 'absolute', left: 39, top: 9, fontFamily: F.bold, fontSize: 16, lineHeight: 19, color: '#fff' },
  // right edge of "₹240" sits at x=272 in the 288pt pill; keep it anchored there for any amount
  amount: { position: 'absolute', right: C.w - 272, top: 9, fontFamily: F.bold, fontSize: 16, lineHeight: 19, color: '#fff' },
});
