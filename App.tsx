import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { useClock } from '@shopify/react-native-skia';
import { useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { CardCanvas, type CardAnim } from './src/components/CardCanvas';
import { ScanContent } from './src/components/ScanContent';
import { AmountContent } from './src/components/AmountContent';
import { PillContent } from './src/components/PillContent';
import { CompactContent } from './src/components/CompactContent';
import { Backdrop } from './src/components/Backdrop';
import { CARD, DESIGN_WIDTH, EXTRA_ISLAND_CLEARANCE, ISLAND, PAID_HOLD_MS, PROCESSING_MS, VIEWFINDER } from './src/design';
import { fontFiles } from './src/fonts';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { LiveActivity } from './modules/orbit-live-activity';

const MERCHANT = 'Vitthal Kirana';

type Phase = 'scan' | 'amount' | 'paying' | 'paid' | 'compact';

// Card morph: a touch of overshoot, like the Dynamic Island
const MORPH = { mass: 1, stiffness: 260, damping: 24 };
// Success springs, identical to the prototype (k=210 c=14, k=240 c=22)
const DISC = { mass: 1, stiffness: 210, damping: 14 };
const CHECK = { mass: 1, stiffness: 240, damping: 22 };

export default function App() {
  const [fontsLoaded] = useFonts(fontFiles);
  const { width } = useWindowDimensions();
  const scale = width / DESIGN_WIDTH;

  // Push the viewfinder below this phone's actual Dynamic Island (0 on phones without one)
  const safeTop = initialWindowMetrics?.insets.top ?? 0;
  const islandBottom = safeTop - ISLAND.bottomAboveSafeArea + ISLAND.gap; // screen points
  const viewfinderTop = (CARD.scan.y + VIEWFINDER.y) * scale;
  const clearance = safeTop >= 59 ? Math.max(0, Math.ceil((islandBottom - viewfinderTop) / scale)) + EXTRA_ISLAND_CLEARANCE : 0;

  const [phase, setPhase] = React.useState<Phase>('scan');
  const [amount, setAmount] = React.useState('');
  const clock = useClock();

  const anim: CardAnim = {
    x: useSharedValue(CARD.scan.x),
    y: useSharedValue(CARD.scan.y),
    w: useSharedValue(CARD.scan.w),
    h: useSharedValue(CARD.scan.h),
    scanMix: useSharedValue(1),
    amountMix: useSharedValue(0),
    pillMix: useSharedValue(0),
    compactMix: useSharedValue(0),
    procStart: useSharedValue(-1),
    successStart: useSharedValue(-1),
    disc: useSharedValue(0),
    check: useSharedValue(0),
  };

  // Clear any Live Activity left over from a previous session
  React.useEffect(() => {
    LiveActivity.end();
  }, []);

  const morphTo = (g: { x: number; y: number; w: number; h: number }) => {
    anim.x.value = withSpring(g.x, MORPH);
    anim.y.value = withSpring(g.y, MORPH);
    anim.w.value = withSpring(g.w, MORPH);
    anim.h.value = withSpring(g.h, MORPH);
  };

  const goScan = () => {
    LiveActivity.end();
    setPhase('scan');
    morphTo(CARD.scan);
    anim.amountMix.value = withTiming(0, { duration: 140 });
    anim.pillMix.value = withTiming(0, { duration: 140 });
    anim.compactMix.value = withTiming(0, { duration: 200 });
    anim.scanMix.value = withDelay(120, withTiming(1, { duration: 260 }));
    anim.procStart.value = -1;
    anim.successStart.value = -1;
    anim.disc.value = 0;
    anim.check.value = 0;
  };

  const onScanned = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAmount(''); // cleared here, so the pill never flashes an empty amount while fading out
    setPhase('amount');
    morphTo(CARD.amount);
    anim.scanMix.value = withTiming(0, { duration: 180 });
    anim.amountMix.value = withDelay(120, withTiming(1, { duration: 280 }));
  };

  const onPay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('paying');
    morphTo(CARD.pill);
    anim.amountMix.value = withTiming(0, { duration: 120 });
    anim.pillMix.value = withDelay(90, withTiming(1, { duration: 260 }));
    anim.procStart.value = clock.value;
    // The real Dynamic Island takes over as soon as you leave the app
    LiveActivity.start(MERCHANT, amount);
  };

  React.useEffect(() => {
    if (phase !== 'paying') return;
    const t = setTimeout(() => {
      anim.successStart.value = clock.value;
      anim.disc.value = withDelay(40, withSpring(1, DISC));
      anim.check.value = withDelay(160, withSpring(1, CHECK));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      LiveActivity.markPaid();
      setPhase('paid');
    }, PROCESSING_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Paid → tuck into the compact pill around the Dynamic Island
  React.useEffect(() => {
    if (phase !== 'paid') return;
    const t = setTimeout(() => {
      setPhase('compact');
      morphTo(CARD.compact);
      anim.compactMix.value = withSpring(1, MORPH);
    }, PAID_HOLD_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!fontsLoaded) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <Backdrop />
      <CardCanvas anim={anim} clock={clock} scale={scale} height={560 * scale} />
      {/* All layout below is in Figma's 402pt frame, scaled to the device width */}
      <View style={[styles.frame, { transform: [{ scale }] }]} pointerEvents="box-none">
        <ScanContent mix={anim.scanMix} active={phase === 'scan'} onScanned={onScanned} clearance={clearance} />
        <AmountContent
          mix={anim.amountMix}
          active={phase === 'amount'}
          amount={amount}
          onChangeAmount={setAmount}
          onPay={onPay}
          onClose={goScan}
        />
        <PillContent mix={anim.pillMix} hide={anim.compactMix} active={phase === 'paying' || phase === 'paid'} paid={phase === 'paid' || phase === 'compact'} amount={amount} onReset={goScan} />
        <CompactContent mix={anim.compactMix} active={phase === 'compact'} amount={amount} onReset={goScan} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  frame: { position: 'absolute', left: 0, top: 0, width: DESIGN_WIDTH, height: 874, transformOrigin: 'top left' },
});
