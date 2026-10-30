import type { ReactNode } from "react";
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./theme";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[s.pad, { paddingTop: insets.top + 12 }]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[s.pad, { flex: 1, paddingTop: insets.top + 12 }]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {body}
    </KeyboardAvoidingView>
  );
}

export function H1({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.h1, { color: t.text }]}>{children}</Text>;
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[s.card, { backgroundColor: t.card, borderColor: t.line }]}>
      {title ? <Text style={[s.cardTitle, { color: t.muted }]}>{title.toUpperCase()}</Text> : null}
      {children}
    </View>
  );
}

export function Body({ children, muted, mono }: { children: ReactNode; muted?: boolean; mono?: boolean }) {
  const t = useTheme();
  return <Text style={[s.body, { color: muted ? t.muted : t.text }, mono && s.mono]}>{children}</Text>;
}

export function Button({ title, onPress, kind = "primary", disabled, busy, testID }: { title: string; onPress: () => void; kind?: "primary" | "secondary" | "danger"; disabled?: boolean; busy?: boolean; testID?: string }) {
  const t = useTheme();
  const bg = kind === "primary" ? t.accent : kind === "danger" ? t.danger : "transparent";
  const fg = kind === "secondary" ? t.text : t.accentText;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: kind === "secondary" ? t.line : bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}
    >
      {busy ? <ActivityIndicator color={fg} /> : <Text style={[s.btnText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, ...rest }: { label: string; hint?: string } & TextInputProps) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[s.label, { color: t.muted }]}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={t.muted}
        {...rest}
        style={[s.input, { color: t.text, borderColor: t.line, backgroundColor: t.bg }]}
      />
      {hint ? <Text style={[s.hint, { color: t.muted }]}>{hint}</Text> : null}
    </View>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={s.rowBetween}>
        <Text style={[s.body, { color: t.text, flex: 1 }]}>{label}</Text>
        <Switch value={value} onValueChange={onChange} />
      </View>
      {hint ? <Text style={[s.hint, { color: t.muted }]}>{hint}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: ReadonlyArray<{ value: T; label: string }>; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View style={[s.seg, { borderColor: t.line }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[s.segItem, { backgroundColor: on ? t.accent : "transparent" }]}>
            <Text style={{ color: on ? t.accentText : t.text, fontWeight: "600" }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ text, tone = "muted" }: { text: string; tone?: "muted" | "ok" | "warn" | "danger" }) {
  const t = useTheme();
  const color = tone === "ok" ? t.ok : tone === "warn" ? t.warn : tone === "danger" ? t.danger : t.muted;
  return (
    <View style={[s.pill, { borderColor: color }]}>
      <Text style={{ color, fontSize: 13, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

export function Row({ k, v }: { k: string; v: string }) {
  const t = useTheme();
  return (
    <View style={s.rowBetween}>
      <Text style={[s.body, { color: t.muted }]}>{k}</Text>
      <Text style={[s.body, s.mono, { color: t.text, flexShrink: 1, textAlign: "right" }]}>{v}</Text>
    </View>
  );
}

/** A level meter fed by an Animated.Value, so it never re-renders React. */
export function LevelBar({ value, label }: { value: Animated.Value; label: string }) {
  const t = useTheme();
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[s.hint, { color: t.muted, marginBottom: 4 }]}>{label}</Text>
      <View style={[s.track, { backgroundColor: t.line }]}>
        <Animated.View style={[s.fill, { backgroundColor: t.accent, transform: [{ scaleX: value.interpolate({ inputRange: [0, 1], outputRange: [0.0001, 1] }) }] }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 48, gap: 12 },
  h1: { fontSize: 26, fontWeight: "700" },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 14, gap: 8 },
  cardTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  body: { fontSize: 15, lineHeight: 21 },
  mono: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 13 },
  btn: { minHeight: 46, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  hint: { fontSize: 12, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  seg: { flexDirection: "row", borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  segItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, width: "100%", borderRadius: 4, transformOrigin: "left" },
});
