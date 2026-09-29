import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { CARD, VIEWFINDER } from '../design';
import { CORNERS } from '../icons';
import { F } from '../fonts';

type Props = { mix: SharedValue<number>; active: boolean; onScanned: () => void; clearance: number };

const C = CARD.scan;

export function ScanContent({ mix, active, onScanned, clearance }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const locked = React.useRef(false);

  React.useEffect(() => {
    if (active) locked.current = false;
  }, [active]);

  React.useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  const fire = () => {
    if (locked.current || !active) return;
    locked.current = true;
    onScanned();
  };

  const style = useAnimatedStyle(() => ({
    opacity: mix.value,
    transform: [{ scale: 0.94 + 0.06 * mix.value }],
  }));

  return (
    <Animated.View style={[styles.card, style]} pointerEvents={active ? 'auto' : 'none'}>
      {/* Rectangle 3: live camera in place of the placeholder photo */}
      <Pressable
        style={[styles.viewfinder, { top: VIEWFINDER.y + clearance, height: VIEWFINDER.h - clearance }]}
        onLongPress={fire}
        delayLongPress={600}
      >
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={active ? fire : undefined}
          />
        ) : (
          <View style={styles.permission}>
            <Text style={styles.permissionText}>Camera access is needed to scan a QR code</Text>
            <Pressable onPress={requestPermission} style={styles.permissionBtn}>
              <Text style={styles.permissionBtnText}>Allow camera</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.border} pointerEvents="none" />
      </Pressable>
      {CORNERS.map((c, i) => (
        // top brackets move down with the viewfinder so their spacing matches Figma
        <SvgXml key={i} xml={c.svg} width={c.w} height={c.h} style={{ position: 'absolute', left: c.x, top: c.y + (i < 2 ? clearance : 0) }} pointerEvents="none" />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', left: C.x, top: C.y, width: C.w, height: C.h },
  viewfinder: {
    position: 'absolute', left: VIEWFINDER.x, top: VIEWFINDER.y, width: VIEWFINDER.w, height: VIEWFINDER.h,
    borderRadius: VIEWFINDER.r, overflow: 'hidden', backgroundColor: '#000',
  },
  border: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: VIEWFINDER.r,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  permissionText: { color: 'rgba(255,255,255,0.7)', fontFamily: F.regular, fontSize: 14, textAlign: 'center' },
  permissionBtn: { backgroundColor: '#2C2C2E', borderRadius: 22, paddingHorizontal: 20, height: 44, justifyContent: 'center' },
  permissionBtnText: { color: '#fff', fontFamily: F.semibold, fontSize: 16 },
});
