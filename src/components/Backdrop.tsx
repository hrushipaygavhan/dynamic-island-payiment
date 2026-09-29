import React from 'react';
import { Alert, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BlurMask, Canvas, Circle, Group, LinearGradient, Rect, vec } from '@shopify/react-native-skia';

const KEY = 'orbitpay.backdrop';

/**
 * iOS never lets an app see through to other apps, so the "floating over your phone"
 * illusion uses a screenshot of your own home screen as the backdrop.
 * Long-press any empty area to choose one. Until then a wallpaper-like default is shown.
 */
export function Backdrop() {
  const { width, height } = useWindowDimensions();
  const [uri, setUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setUri(v)).catch(() => {});
  }, []);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets?.[0]) return;
    const next = res.assets[0].uri;
    setUri(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  };

  const reset = () => {
    setUri(null);
    AsyncStorage.removeItem(KEY).catch(() => {});
  };

  const onLongPress = () => {
    Alert.alert('Background', 'Use a screenshot of your home screen to make the flow feel like it floats over your phone.', [
      { text: 'Choose screenshot', onPress: pick },
      ...(uri ? [{ text: 'Use default', onPress: reset }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <Pressable style={StyleSheet.absoluteFill} onLongPress={onLongPress} delayLongPress={500}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={reset} />
      ) : (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={['#0E1B3D', '#1B2F5E', '#3A2A5C']} />
          </Rect>
          <Group>
            <BlurMask blur={90} style="normal" />
            <Circle cx={width * 0.15} cy={height * 0.55} r={width * 0.55} color="rgba(74,122,255,0.55)" />
            <Circle cx={width * 0.95} cy={height * 0.35} r={width * 0.45} color="rgba(255,138,92,0.35)" />
            <Circle cx={width * 0.6} cy={height * 0.95} r={width * 0.6} color="rgba(139,92,246,0.45)" />
          </Group>
        </Canvas>
      )}
    </Pressable>
  );
}
