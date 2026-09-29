import { requireOptionalNativeModule } from 'expo';

type NativeLiveActivity = {
  areActivitiesEnabled(): boolean;
  start(merchant: string, amount: string): Promise<boolean>;
  markPaid(): Promise<void>;
  end(): Promise<void>;
};

// Missing in Expo Go (no native code there), so every call quietly does nothing.
const native = requireOptionalNativeModule<NativeLiveActivity>('OrbitLiveActivity');

export const LiveActivity = {
  available: native != null,
  start(merchant: string, amount: string) {
    return native ? native.start(merchant, amount).catch(() => false) : Promise.resolve(false);
  },
  markPaid() {
    return native ? native.markPaid().catch(() => {}) : Promise.resolve();
  },
  end() {
    return native ? native.end().catch(() => {}) : Promise.resolve();
  },
};
