import { sdk } from "@/lib/sdk";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useConfig } from "@/state/config-context";
import { Card, H1, Row, Screen } from "@/ui/kit";

function livekitVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("livekit-client") as { version: string }).version;
  } catch {
    return "not loaded";
  }
}

export default function DiagnosticsScreen() {
  const { config } = useConfig();
  return (
    <Screen>
      <H1>Info</H1>
      <Card title="SDK">
        <Row k="@csplus/react-native" v={sdk?.VERSION ?? "not loaded"} />
        <Row k="livekit-client" v={livekitVersion()} />
      </Card>
      <Card title="Device">
        <Row k="platform" v={`${Platform.OS} ${String(Platform.Version)}`} />
        <Row k="app id (declared)" v={config.appId || "–"} />
        <Row k="Expo SDK" v={Constants.expoConfig?.sdkVersion ?? "–"} />
        <Row k="build" v={Constants.executionEnvironment} />
      </Card>
      <Card title="Mode">
        <Row k="auth" v={config.mode} />
        <Row k="token endpoint" v={config.tokenEndpoint || "default (production)"} />
        <Row k="background" v={config.background} />
      </Card>
    </Screen>
  );
}
