import { useCallback, useEffect, useState } from "react";
import type { MicrophoneDevice } from "@csplus/react-native";
import { useDemoCall } from "@/state/call-context";
import { Body, Button, Card, H1, LevelBar, Screen } from "@/ui/kit";
import { Platform } from "react-native";

export default function AudioScreen() {
  const { call, outputLevel, inputLevel } = useDemoCall();
  const [mics, setMics] = useState<MicrophoneDevice[] | null>(null);
  const [note, setNote] = useState("");
  const live = call.state === "connected";

  const refresh = useCallback(() => {
    call
      .listMicrophones()
      .then((m) => setMics(m))
      .catch((e: unknown) => setNote(`listMicrophones failed: ${e instanceof Error ? e.message : String(e)}`));
  }, [call]);

  useEffect(() => {
    if (live) refresh();
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (label: string, p: Promise<unknown>) => {
    setNote("");
    p.then(() => setNote(`${label}: ok`)).catch((e: unknown) => setNote(`${label}: ${e instanceof Error ? e.message : String(e)}`));
  };

  return (
    <Screen>
      <H1>Audio</H1>
      {!live ? <Body muted>Start a call to route audio.</Body> : null}

      <Card title="Output">
        <Body muted>Current route you chose: {call.audioOutput ?? "none (the OS decides)"}</Body>
        {call.availableAudioOutputs.length === 0 ? <Body muted>No routes reported yet.</Body> : null}
        {call.availableAudioOutputs.map((o) => (
          <Button key={o} title={o === call.audioOutput ? `${o} (selected)` : o} kind="secondary" disabled={!live} onPress={() => run(`output ${o}`, call.setAudioOutput(o))} />
        ))}
        {Platform.OS === "ios" ? <Button title="System route picker" kind="secondary" disabled={!live} onPress={() => run("route picker", call.showAudioRoutePicker())} /> : null}
      </Card>

      <Card title="Microphone">
        <Button title="Refresh list" kind="secondary" onPress={refresh} />
        {mics?.length === 0 ? <Body muted>No microphones reported.</Body> : null}
        {mics?.map((m) => (
          <Button key={m.deviceId} title={m.label || m.deviceId} kind="secondary" disabled={!live} onPress={() => run(`mic ${m.label || m.deviceId}`, call.setMicrophone(m.deviceId))} />
        ))}
      </Card>

      <Card title="Levels">
        <LevelBar value={outputLevel} label="Agent voice" />
        <LevelBar value={inputLevel} label="Your microphone" />
      </Card>

      {note ? <Body mono>{note}</Body> : null}
    </Screen>
  );
}
