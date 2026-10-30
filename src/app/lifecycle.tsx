import { View } from "react-native";
import { formatTime } from "@/lib/event-log";
import { useConfig } from "@/state/config-context";
import { useDemoCall } from "@/state/call-context";
import { Body, Button, Card, H1, Screen, Segmented } from "@/ui/kit";

export default function LifecycleScreen() {
  const { config, update } = useConfig();
  const { log, clearLog, call } = useDemoCall();
  const inCall = call.state === "connected" || call.state === "reconnecting" || call.state === "connecting";

  return (
    <Screen>
      <H1>Lifecycle</H1>
      <Card title="When the app goes to the background">
        <Segmented
          value={config.background}
          onChange={(background) => update({ background })}
          options={[
            { value: "continue", label: "Keep the call" },
            { value: "end", label: "Hang up" },
          ]}
        />
        <Body muted>
          “Keep the call” needs the iOS audio background mode and, on Android 14+, a microphone foreground service. This build declares the permissions but does not start a service, so the Android case should fail cleanly: that is the thing to observe.
        </Body>
        {inCall ? <Body muted>Takes effect for the next call.</Body> : null}
      </Card>

      <Card title="Things to try during a call">
        <Body muted>Lock the screen · press Home · take a phone call · ask Siri · unplug headphones · switch Wi-Fi/cellular · airplane mode for 10 s. Read the log below afterwards.</Body>
      </Card>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button title="Clear log" kind="secondary" onPress={clearLog} />
        </View>
      </View>

      <Card title={`Event log (${log.length})`}>
        {log.length === 0 ? <Body muted>Nothing yet.</Body> : null}
        {[...log].reverse().map((e, i) => (
          <Body key={`${e.at}-${i}`} mono muted={e.kind === "app"}>
            {formatTime(e.at)} {e.kind.padEnd(5)} {e.text}
          </Body>
        ))}
      </Card>
    </Screen>
  );
}
