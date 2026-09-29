import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { F } from '../fonts';

type Props = { mix: SharedValue<number>; hide: SharedValue<number>; active: boolean; paid: boolean; amount: string; onReset: () => void };

export function PillContent({ mix, hide, active, paid, amount, onReset }: Props) {
  const paidV = useSharedValue(0);
  React.useEffect(() => {
    paidV.value = paid ? withSpring(1, { mass: 1, stiffness: 300, damping: 22 }) : withTiming(0, { duration: 0 });
  }, [paid, paidV]);

  const root = useAnimatedStyle(() => ({
    opacity: mix.value * Math.max(0, 1 - hide.value * 2.5),
    transform: [{ translateY: interpolate(mix.value, [0, 1], [6, 0]) }],
  }));
  const paying = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, paidV.value * 1.4),
    transform: [{ translateY: -8 * paidV.value }],
  }));
  const paidStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, paidV.value),
    transform: [{ translateY: 8 * (1 - paidV.value) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, root]} pointerEvents={active ? 'box-none' : 'none'}>
      <Pressable style={styles.hit} onPress={paid ? onReset : undefined} accessibilityLabel={paid ? 'Payment complete. Tap to scan again' : 'Paying'} />
      <View style={styles.labels} pointerEvents="none">
        <View style={styles.overRow}>
          <Animated.Text style={[styles.over, paying]}>PAYING</Animated.Text>
          <Animated.Text style={[styles.over, styles.abs, paidStyle]}>PAID</Animated.Text>
        </View>
        <Text style={styles.title}>₹{amount} to Vitthal Kirana</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', left: 14, top: 14, width: 374, height: 99 },
  labels: { position: 'absolute', left: 92, top: 44, gap: 2 },
  overRow: { height: 16 },
  over: { fontFamily: F.regular, fontSize: 14, lineHeight: 16, color: 'rgba(255,255,255,0.7)' },
  abs: { position: 'absolute', left: 0, top: 0 },
  title: { fontFamily: F.bold, fontSize: 20, lineHeight: 23, color: '#fff' },
});
