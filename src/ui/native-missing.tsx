import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform, ScrollView, Text, View } from "react-native";
import { isNativeModuleMissing } from "@/lib/sdk";
import { useTheme } from "./theme";

/** Shown instead of the app when the CS+ SDK could not load. */
export function NativeMissing({ error }: { error: Error }) {
  const t = useTheme();
  const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const missing = isNativeModuleMissing(error);
  const code = (s: string) => <Text style={{ fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), color: t.text }}>{s}</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 20, paddingTop: 72, gap: 14 }}>
      <Text style={{ color: t.text, fontSize: 24, fontWeight: "700" }}>
        {missing ? "This build can't make calls" : "The CS+ SDK failed to load"}
      </Text>

      {missing ? (
        <>
          <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>
            The SDK needs native audio (WebRTC) modules.{" "}
            {inExpoGo
              ? "You are running in Expo Go, which does not include them."
              : "They are not part of the app that is running, so it was probably not built from this project."}
          </Text>
          <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>Build a development client instead, then open that app:</Text>
          <View style={{ gap: 6 }}>
            {code("npx expo run:android --device   # needs the Android SDK on your computer")}
            {code("npx eas-cli build --profile development --platform android   # cloud build, no SDK needed")}
          </View>
          <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>
            Install the result on your phone, then run {`"npx expo start --dev-client"`} and open it there. Details: the repository README, "Run".
          </Text>
        </>
      ) : null}

      <Text style={{ color: t.muted, fontSize: 12 }}>Original error</Text>
      {code(error.message)}
    </ScrollView>
  );
}
