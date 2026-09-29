import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * The Figma file uses "Aeonik Soft Pro" (a commercial CoType font — the file has the TRIAL build).
 * It can't be shipped here, so the app runs on Inter until you add it:
 *
 *   1. Put your licensed files in assets/fonts/ (names below).
 *   2. Set USE_AEONIK = true and uncomment the four require() lines.
 */
const USE_AEONIK = false;

const aeonikFiles = {
  // 'Aeonik-Regular': require('../assets/fonts/AeonikSoftPro-Regular.otf'),
  // 'Aeonik-Medium': require('../assets/fonts/AeonikSoftPro-Medium.otf'),
  // 'Aeonik-SemiBold': require('../assets/fonts/AeonikSoftPro-SemiBold.otf'),
  // 'Aeonik-Bold': require('../assets/fonts/AeonikSoftPro-Bold.otf'),
};

export const fontFiles = {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  ...(USE_AEONIK ? aeonikFiles : {}),
};

export const F = USE_AEONIK
  ? { regular: 'Aeonik-Regular', medium: 'Aeonik-Medium', semibold: 'Aeonik-SemiBold', bold: 'Aeonik-Bold' }
  : { regular: 'Inter_400Regular', medium: 'Inter_500Medium', semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold' };

// The ₹ glyph is set in Inter Semi Bold in the design regardless
export const RUPEE_FONT = 'Inter_600SemiBold';
