import React from 'react';
import { Image, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence,
  withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import {
  AMOUNT_TEXT_GRADIENT, AMOUNT_TEXT_X, BANK_BUTTON, CARET, COLORS, PAY_BUTTON, RUPEE_X,
} from '../design';
import { AVATAR, CHEVRONS, CLOSE, lock } from '../icons';
import { F, RUPEE_FONT } from '../fonts';
import { FigmaRect } from './FigmaRect';

type Props = {
  mix: SharedValue<number>;
  active: boolean;
  amount: string;
  onChangeAmount: (v: string) => void;
  onPay: () => void;
  onClose: () => void;
};

const SNAPPY = { mass: 1, stiffness: 420, damping: 30 };

export function AmountContent({ mix, active, amount, onChangeAmount, onPay, onClose }: Props) {
  const input = React.useRef<TextInput>(null);
  const [textW, setTextW] = React.useState(0);
  const caretX = useSharedValue(CARET.emptyX);
  const blink = useSharedValue(1);
  const enabled = useSharedValue(0);
  const press = useSharedValue(1);
  const canPay = Number(amount) > 0;

  React.useEffect(() => {
    if (active) {
      const t = setTimeout(() => input.current?.focus(), 280);
      return () => clearTimeout(t);
    }
    input.current?.blur();
  }, [active]);

  React.useEffect(() => {
    const x = amount.length ? AMOUNT_TEXT_X + textW + CARET.gapAfterText : CARET.emptyX;
    caretX.value = withSpring(x, SNAPPY);
    // Solid while typing, then blink like the system caret
    blink.value = withSequence(
      withTiming(1, { duration: 0 }),
      withRepeat(
        withSequence(
          withDelay(450, withTiming(0, { duration: 90 })),
          withDelay(400, withTiming(1, { duration: 90 })),
        ),
        -1,
      ),
    );
  }, [amount, textW, caretX, blink]);

  React.useEffect(() => {
    enabled.value = withTiming(canPay ? 1 : 0, { duration: 220 });
  }, [canPay, enabled]);

  const root = useAnimatedStyle(() => ({
    opacity: mix.value,
    transform: [{ translateY: interpolate(mix.value, [0, 1], [10, 0]) }],
  }));
  const caretStyle = useAnimatedStyle(() => ({
    opacity: blink.value,
    transform: [{ translateX: caretX.value - CARET.w / 2 }],
  }));
  const payOn = useAnimatedStyle(() => ({ opacity: enabled.value }));
  const payOff = useAnimatedStyle(() => ({ opacity: 1 - enabled.value }));
  const payScale = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  // caret swaps from the orange "empty" gradient to the mint "typing" gradient
  const filled = useSharedValue(0);
  React.useEffect(() => {
    filled.value = withTiming(amount.length ? 1 : 0, { duration: 180 });
  }, [amount, filled]);
  const caretTyping = useAnimatedStyle(() => ({ opacity: filled.value }));

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 6);
    onChangeAmount(digits);
  };

  const amountStyle = styles.amount;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, root]} pointerEvents={active ? 'box-none' : 'none'}>
      <SvgXml xml={AVATAR} width={44} height={44} style={{ position: 'absolute', left: 34, top: 34 }} />

      <View style={styles.labels}>
        <Text style={styles.over}>PAY</Text>
        <Text style={styles.merchant}>Vitthal Kirana</Text>
      </View>

      <Pressable style={styles.close} onPress={onClose} hitSlop={10} accessibilityLabel="Cancel payment">
        <SvgXml xml={CLOSE} width={14} height={14} />
      </Pressable>

      <Text style={styles.rupee}>₹</Text>

      {/* Digits: white with the Figma gradient laid over at 50% */}
      <Pressable style={styles.amountHit} onPress={() => input.current?.focus()}>
        {amount.length > 0 && (
          <MaskedView
            style={{ width: Math.max(1, textW), height: 63 }}
            maskElement={<Text style={amountStyle}>{amount}</Text>}
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff' }]} />
            {textW > 0 && <FigmaRect w={textW} h={63} r={0} gradient={AMOUNT_TEXT_GRADIENT} />}
          </MaskedView>
        )}
        {/* invisible copy for measuring */}
        <Text style={[amountStyle, styles.measure]} onLayout={(e) => setTextW(e.nativeEvent.layout.width)}>
          {amount}
        </Text>
      </Pressable>

      <Animated.View style={[styles.caret, caretStyle]} pointerEvents="none">
        <LinearGradient
          colors={CARET.emptyColors as unknown as [string, string, string]}
          locations={CARET.locations as unknown as [number, number, number]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, caretTyping]}>
          <LinearGradient
            colors={CARET.colors as unknown as [string, string, string]}
            locations={CARET.locations as unknown as [number, number, number]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>

      <TextInput
        ref={input}
        value={amount}
        onChangeText={onChange}
        keyboardType="number-pad"
        keyboardAppearance="dark"
        caretHidden
        style={styles.hiddenInput}
      />

      {/* Bank selector */}
      <View style={styles.bank}>
        <FigmaRect w={BANK_BUTTON.w} h={BANK_BUTTON.h} r={BANK_BUTTON.r} base={BANK_BUTTON.base} gradient={BANK_BUTTON.gradient} stroke={[0.173, 0.173, 0.173, 1]} />
        <Image source={require('../../assets/sbi.png')} style={styles.logo} />
        <View style={styles.bankText}>
          <Text style={styles.bankName}>SBI Bank</Text>
          <Text style={styles.bankNum}>•• 4821</Text>
        </View>
        <SvgXml xml={CHEVRONS} width={20} height={20} style={{ position: 'absolute', left: 149, top: 19 }} />
      </View>

      {/* Pay */}
      <Pressable
        disabled={!canPay}
        onPressIn={() => { press.value = withSpring(0.94, SNAPPY); }}
        onPressOut={() => { press.value = withSpring(1, { mass: 1, stiffness: 300, damping: 12 }); }}
        onPress={() => { Keyboard.dismiss(); onPay(); }}
        style={styles.payHit}
        accessibilityRole="button"
        accessibilityLabel="Pay"
      >
        <Animated.View style={[StyleSheet.absoluteFill, payScale]}>
          <Animated.View style={[StyleSheet.absoluteFill, payOff]}>
            <FigmaRect w={PAY_BUTTON.w} h={PAY_BUTTON.h} r={PAY_BUTTON.r} base={COLORS.payDisabledBg} />
            <SvgXml xml={lock(COLORS.payDisabledText)} width={16} height={16} style={styles.lock} />
            <Text style={[styles.payText, { color: COLORS.payDisabledText }]}>Pay</Text>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, payOn]}>
            <FigmaRect w={PAY_BUTTON.w} h={PAY_BUTTON.h} r={PAY_BUTTON.r} base={COLORS.payDisabledBg} gradient={PAY_BUTTON.gradient} />
            <SvgXml xml={lock(COLORS.payText)} width={16} height={16} style={styles.lock} />
            <Text style={[styles.payText, { color: COLORS.payText }]}>Pay</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  labels: { position: 'absolute', left: 92, top: 36, gap: 2 },
  over: { fontFamily: F.regular, fontSize: 14, lineHeight: 16, color: 'rgba(255,255,255,0.7)' },
  merchant: { fontFamily: F.bold, fontSize: 20, lineHeight: 23, color: '#fff' },
  close: {
    position: 'absolute', left: 334, top: 38, width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.closeBtn, alignItems: 'center', justifyContent: 'center',
  },
  rupee: { position: 'absolute', left: RUPEE_X, top: 108, fontFamily: RUPEE_FONT, fontSize: 60.45, lineHeight: 73, color: '#fff' },
  amountHit: { position: 'absolute', left: AMOUNT_TEXT_X, top: 113, height: 63, minWidth: 240, flexDirection: 'row' },
  amount: { fontFamily: F.bold, fontSize: 54, lineHeight: 63, color: '#000' },
  measure: { position: 'absolute', left: 0, top: 0, opacity: 0 },
  caret: { position: 'absolute', left: 0, top: CARET.y, width: CARET.w, height: CARET.h, borderRadius: CARET.w / 2, overflow: 'hidden' },
  hiddenInput: { position: 'absolute', left: -1000, top: 0, width: 10, height: 10, opacity: 0 },
  bank: { position: 'absolute', left: BANK_BUTTON.x, top: BANK_BUTTON.y, width: BANK_BUTTON.w, height: BANK_BUTTON.h },
  logo: { position: 'absolute', left: 15.5, top: 13.5, width: 31, height: 31 },
  bankText: { position: 'absolute', left: 59, top: 13, width: 78, gap: 2 },
  bankName: { fontFamily: F.medium, fontSize: 14, lineHeight: 16, color: '#fff' },
  bankNum: { fontFamily: F.regular, fontSize: 12, lineHeight: 14, color: COLORS.subText },
  payHit: { position: 'absolute', left: PAY_BUTTON.x, top: PAY_BUTTON.y, width: PAY_BUTTON.w, height: PAY_BUTTON.h },
  lock: { position: 'absolute', left: 42, top: 21 },
  payText: { position: 'absolute', left: 66, top: 18.5, fontFamily: F.semibold, fontSize: 18, lineHeight: 21 },
});
