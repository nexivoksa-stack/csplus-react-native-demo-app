/**
 * The CS+ SDK, loaded defensively.
 *
 * Importing it pulls in the native WebRTC modules, which do not exist in Expo
 * Go (or in any app built without them). A plain `import` would crash the whole
 * app with a red screen before anything could say why, so it is loaded here in
 * a try/catch and the app shows an explanation instead.
 */
type Sdk = typeof import("@csplus/react-native");

let sdk: Sdk | null = null;
let sdkError: Error | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sdk = require("@csplus/react-native") as Sdk;
} catch (e) {
  sdkError = e instanceof Error ? e : new Error(String(e));
}

export { sdk, sdkError };

/** True for the failure this guard exists for: the native layer is not in this build. */
export function isNativeModuleMissing(error: Error | null): boolean {
  return !!error && /native module not found|WebRTC|Cannot find native module|NativeModule/i.test(error.message);
}
