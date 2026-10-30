import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { friendly, agentTone, stateTone } from "@/lib/present";
import { useDemoCall } from "@/state/call-context";
import { Body, Button, Card, H1, LevelBar, Pill, Screen, Field } from "@/ui/kit";
import { useTheme } from "@/ui/theme";

export default function CallScreen() {
  const t = useTheme();
  const { call, problems, outputLevel, inputLevel } = useDemoCall();
  const [draft, setDraft] = useState("");
  const live = call.state === "connected" || call.state === "reconnecting";
  const starting = call.state === "connecting";
  const canRetry = call.state === "failed" || call.state === "ended";

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    call.sendText(text).catch(() => undefined);
  };

  return (
    <Screen scroll={false}>
      <H1>Call</H1>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Pill text={call.state} tone={stateTone(call.state)} />
        <Pill text={`agent: ${call.agentState ?? "–"}`} tone={agentTone(call.agentState)} />
        {call.endReason ? <Pill text={`ended: ${call.endReason}`} /> : null}
      </View>

      {problems.length > 0 && !live ? (
        <Card title="Not ready">
          {problems.map((p) => (
            <Body key={p} muted>
              {p} (Config tab)
            </Body>
          ))}
        </Card>
      ) : null}

      {call.error ? (
        <Card title="Error">
          <Body>{friendly(call.error.code)}</Body>
          <Body mono muted>
            {call.error.code} · retriable: {String(call.error.retriable)}
          </Body>
          <Body mono muted>
            {call.error.message}
          </Body>
        </Card>
      ) : null}

      <View style={{ flexDirection: "row", gap: 8 }}>
        {live || starting ? (
          <View style={{ flex: 1 }}>
            <Button testID="hangup" title={starting ? "Cancel" : "Hang up"} kind="danger" onPress={() => void call.end()} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Button
              testID="start"
              title={canRetry && call.error ? "Try again" : "Start call"}
              disabled={problems.length > 0}
              onPress={() => call.start().catch(() => undefined)}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button testID="mute" title={call.isMuted ? "Unmute" : "Mute"} kind="secondary" disabled={!live} onPress={call.isMuted ? call.unmute : call.mute} />
        </View>
      </View>

      <Card>
        <LevelBar value={outputLevel} label="Agent voice" />
        <LevelBar value={inputLevel} label="Your microphone (may stay empty on a phone; see the plan)" />
      </Card>

      <Card title="Transcript">
        <FlatList
          style={{ maxHeight: 260 }}
          data={[...call.messages]}
          keyExtractor={(m) => m.id}
          ListEmptyComponent={<Body muted>Nothing said yet.</Body>}
          renderItem={({ item }) => (
            <Text style={{ color: item.role === "user" ? t.accent : t.text, fontSize: 15, marginBottom: 6, fontStyle: item.final ? "normal" : "italic" }}>
              {item.role === "user" ? "You" : "Agent"}: {item.text}
            </Text>
          )}
        />
      </Card>

      <Field label="Type a message" value={draft} onChangeText={setDraft} editable={live} onSubmitEditing={send} returnKeyType="send" placeholder={live ? "Say it in text" : "Start a call first"} />
      <Button testID="send" title="Send" kind="secondary" disabled={!live || !draft.trim()} onPress={send} />
    </Screen>
  );
}
