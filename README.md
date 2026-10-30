# csplus-react-native-demo-app

An Expo app for testing [`@csplus/react-native`](../csplus-client-sdk/packages/react-native)
on real phones, **the way a customer would install it**: from packed tarballs
(`vendor/`), with peer dependencies, the Expo config plugins and a real native
build. It is also the dogfood for the package (Phase 7 of
`../csplus-client-sdk/CSPLUS_REACT_NATIVE_SDK_PLAN.md`): "dogfooded in the CS+
demo app" is the most it can honestly claim, not "customer-validated".

> **Status.** The JavaScript is type-checked, unit-tested, and bundles with
> Metro for iOS and Android (Hermes bytecode). `expo prebuild` generates both
> native projects through the `@csplus/react-native` Expo plugin (microphone reason,
> background audio, only the Android permissions a call needs, LiveKit wiring). **It has not been built into a binary or run on a device yet**; the
> machine this was written on has no Xcode or Android SDK. The first real
> milestone is below.

## What it is for

| Tab | Exercises | Plan reference |
|---|---|---|
| **Call** | start / hang up / mute, agent state, live transcript (interim → final), typed text, retry, errors with `code` + `retriable`, agent and mic level bars | §5, §11 |
| **Config** | publishable key **or** signed mode; token endpoint (staging), agent, language, declared `appId` | §7 |
| **Audio** | output routes (`availableAudioOutputs`, `setAudioOutput`, iOS route picker), microphone list and switch | §5.2, §9.1 |
| **Lifecycle** | `background: continue \| end`, and a timestamped log of `AppState` and call transitions | §9.2–9.3 |
| **Info** | SDK, `livekit-client`, platform, build environment | §6.5 |

The call lives above the tabs, so switching screens never hangs up.

## Requirements

- Node 22+, npm.
- **A development build.** Expo Go cannot load the native WebRTC modules.
- To build locally: Xcode (macOS) for iOS, Android Studio + JDK 17 for Android.
  Or build in the cloud with EAS (`eas.json` has `development` profiles):
  `npx eas-cli@latest build --profile development --platform android`.
- **A real device for audio.** The iOS Simulator cannot publish a microphone.
- A CS+ token service and agent. Today's production service **refuses native
  apps** (it requires a browser `Origin`); see "Backend" below.

## Run

```bash
npm install
npx expo prebuild          # generates ios/ and android/ (gitignored)
npx expo run:android       # or: npx expo run:ios   (needs a device or emulator + toolchain)
npx expo start --dev-client
```

Then open **Config**, enter a key (or switch to Signed), and go to **Call**.

> **"WebRTC native module not found" / a red screen on launch** means the app you
> opened is not a development build: scanning the QR code from `npx expo start`
> opens **Expo Go**, which has no WebRTC. Build and install a development client
> first (`npx expo run:android --device`, or `npx eas-cli build --profile development
> --platform android` and install the APK), then `npx expo start --dev-client`.
> This build now shows an explanation screen instead of a red screen.

## The edit → device loop

The SDK is in the sibling repo `../csplus-client-sdk`. After changing it:

```bash
npm run sdk:sync       # build the SDK, pack into vendor/, reinstall
```

(`CSPLUS_SDK_DIR` overrides where the SDK repo is.) `vendor/*.tgz` is committed
so a clean clone builds with nothing but this repo; re-run `sdk:sync` to
refresh it. The three packages are not on npm yet; `package.json` `overrides`
make the packed `react-native` resolve its siblings from the same
tarballs.

## Signed mode and the mint server

In signed mode the app holds **no credential**. A server you control asks CS+
for a single-use grant and hands it to the app. `server/mint-server.mjs` is a
~60-line stand-in for that backend:

```bash
CSPLUS_SECRET_KEY=csp_sk_live_...  npm run mint-server    # real
MINT_FAKE=1                         npm run mint-server    # plumbing only
```

Point the app's **Mint server URL** at it: `http://10.0.2.2:8787` from the
Android emulator, your computer's LAN IP from a real phone. The secret stays on
the server and is never sent to the app (a test pins this). This demo server has
no user authentication: run it on a trusted network only.

## Backend: what works today

| | Today's token service | After `CSPLUS_REACT_NATIVE_SDK_PLAN.md` phases 1 and 1b |
|---|---|---|
| Browser, publishable key | yes | yes |
| Native app, publishable key | **no**: missing `Origin` is refused | yes, with the key's allowed app ids |
| Signed mode (`/v1/web/call-grants`) | **no**: endpoint does not exist | yes |

So until the service work lands, a call from this app is expected to fail with
a token refusal. That still tests the whole client path up to the token
request, and the error screen.

## Checks

```bash
npm run typecheck                       # tsc
npm test                                # pure logic, mint server, copy checker
node scripts/check-livekit-copies.mjs   # exactly one livekit-client installed
npx expo export --platform android --platform ios --output-dir /tmp/x   # Metro bundles both
```

## Test matrix (record results here; a blank is not a pass)

The full matrix is in `../csplus-client-sdk/CSPLUS_REACT_NATIVE_SDK_PLAN.md` §11.
First milestone, **Phase 0**: on one real Android and one real iPhone —

- [ ] A build installs and the app opens (the native layer loads: `setup()` does not throw).
- [ ] Start → mic permission prompt → connects → the agent is **audible** → transcript appears (interim, then final).
- [ ] Deny the mic: which `code` and message appear? (Settles `mic-errors.ts`.)
- [ ] Output routes: what do Audio-tab lists contain on each OS?
- [ ] Lock the screen / background for 1 minute with each `background` setting: what does the log say?
- [ ] Android 14 with no foreground service, backgrounded: what does the call end as?
- [ ] Incoming phone call mid-call: what happens?

| Date | SDK build | Device / OS | Steps failed (notes) | Tester |
|---|---|---|---|---|
| | | | | |
