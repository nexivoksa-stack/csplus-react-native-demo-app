import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CallProvider } from "@/state/call-context";
import { ConfigProvider } from "@/state/config-context";
import { sdk, sdkError } from "@/lib/sdk";
import { NativeMissing } from "@/ui/native-missing";
import { useTheme } from "@/ui/theme";

// Once, at app entry, before any call: installs the native WebRTC layer.
let setupError: Error | null = sdkError;
if (sdk) {
  try {
    sdk.setup();
  } catch (e) {
    setupError = e instanceof Error ? e : new Error(String(e));
  }
}

function Shell() {
  const t = useTheme();
  const tab = { tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 13, fontWeight: "600" as const }, tabBarIconStyle: { display: "none" as const } };
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: t.accent,
          tabBarInactiveTintColor: t.muted,
          tabBarStyle: { backgroundColor: t.card, borderTopColor: t.line },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Call", ...tab }} />
        <Tabs.Screen name="config" options={{ title: "Config", ...tab }} />
        <Tabs.Screen name="audio" options={{ title: "Audio", ...tab }} />
        <Tabs.Screen name="lifecycle" options={{ title: "Lifecycle", ...tab }} />
        <Tabs.Screen name="diagnostics" options={{ title: "Info", ...tab }} />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  // Without the native modules (Expo Go, or a build without them) nothing below
  // can work, and a red screen would not say why.
  if (setupError) return <NativeMissing error={setupError} />;
  return (
    <SafeAreaProvider>
      <ConfigProvider>
        <CallProvider>
          <Shell />
        </CallProvider>
      </ConfigProvider>
    </SafeAreaProvider>
  );
}
