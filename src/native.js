// Thin wrappers around the native Capacitor plugins. Every call is guarded so the
// web build (and any non-native platform) is a safe no-op — the React app never
// has to know whether it's running inside the native shell.
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNative = (() => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
})();

// Hide the launch splash once the app has rendered (avoids a white flash).
export function hideSplash() {
  if (!isNative) return;
  SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});
}

// Match the native status bar to the active theme: light icons on dark themes,
// dark icons on light themes, with the bar tinted to the gradient's base color.
export function applyStatusBar({ dark, color }) {
  if (!isNative) return;
  try {
    // Style.Dark = light text/icons (for dark backgrounds); Style.Light = dark text.
    StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    if (color) StatusBar.setBackgroundColor({ color }); // Android only
  } catch { /* ignore */ }
}

// Register a hardware/gesture back-button handler. Returns an unsubscribe fn.
export function registerBackButton(handler) {
  if (!isNative) return () => {};
  let sub = null;
  CapApp.addListener('backButton', handler).then((s) => { sub = s; }).catch(() => {});
  return () => { try { sub && sub.remove(); } catch { /* ignore */ } };
}

export function exitApp() {
  if (!isNative) return;
  try { CapApp.exitApp(); } catch { /* ignore */ }
}
