import type { UseCallResult } from "@csplus/react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState, Animated } from "react-native";
import { configProblems } from "@/lib/config";
import { append, type LogEntry } from "@/lib/event-log";
import { makeGrantFetcher } from "@/lib/grant";
import { sdk } from "@/lib/sdk";
import { useConfig } from "./config-context";

interface CallValue {
  call: UseCallResult;
  /** Why a call cannot be started, empty when it can. */
  problems: string[];
  /** 0..1, driven without re-rendering. */
  outputLevel: Animated.Value;
  inputLevel: Animated.Value;
  log: readonly LogEntry[];
  clearLog(): void;
}

const Ctx = createContext<CallValue | null>(null);

/**
 * One call for the whole app, held above the tabs: switching screens must not
 * hang up. Everything the screens show comes from here.
 */
export function CallProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const [log, setLog] = useState<readonly LogEntry[]>([]);
  const outputLevel = useRef(new Animated.Value(0)).current;
  const inputLevel = useRef(new Animated.Value(0)).current;

  const note = useCallback((kind: LogEntry["kind"], text: string) => {
    setLog((prev) => append(prev, { at: Date.now(), kind, text }));
  }, []);

  const getGrant = useMemo(() => makeGrantFetcher(config), [config]);

  // Signed mode passes only the grant: the agent, language and context were
  // fixed when the mint server asked for it.
  // CallProvider is only rendered once the SDK loaded (see app/_layout.tsx).
  const call = sdk!.useCall(
    config.mode === "signed"
      ? {
          callGrant: getGrant,
          appId: config.appId.trim() || undefined,
          background: config.background,
          onEnded: (reason) => note("call", `ended (${reason})`),
          onAudioLevel: (l) => outputLevel.setValue(l),
          onInputLevel: (l) => inputLevel.setValue(l),
        }
      : {
          publicKey: config.publicKey.trim(),
          tokenEndpoint: config.tokenEndpoint.trim() || undefined,
          agentId: config.agentId.trim() || undefined,
          lang: config.lang.trim() || undefined,
          appId: config.appId.trim() || undefined,
          background: config.background,
          onEnded: (reason) => note("call", `ended (${reason})`),
          onAudioLevel: (l) => outputLevel.setValue(l),
          onInputLevel: (l) => inputLevel.setValue(l),
        },
  );

  // Log every transition, so a lock-screen or interruption case can be read back.
  const lastState = useRef(call.state);
  useEffect(() => {
    if (lastState.current !== call.state) {
      note("call", `state ${lastState.current} -> ${call.state}`);
      lastState.current = call.state;
    }
  }, [call.state, note]);
  const lastAgent = useRef(call.agentState);
  useEffect(() => {
    if (lastAgent.current !== call.agentState) {
      note("call", `agent ${lastAgent.current ?? "none"} -> ${call.agentState ?? "none"}`);
      lastAgent.current = call.agentState;
    }
  }, [call.agentState, note]);
  const lastError = useRef(call.error);
  useEffect(() => {
    if (call.error && lastError.current !== call.error) note("call", `error ${call.error.code} (retriable: ${call.error.retriable})`);
    lastError.current = call.error;
  }, [call.error, note]);
  useEffect(() => {
    if (call.audioOutput) note("audio", `output -> ${call.audioOutput}`);
  }, [call.audioOutput, note]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => note("app", `AppState ${s}`));
    return () => sub.remove();
  }, [note]);

  const value = useMemo<CallValue>(
    () => ({ call, problems: configProblems(config), outputLevel, inputLevel, log, clearLog: () => setLog([]) }),
    [call, config, outputLevel, inputLevel, log],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoCall(): CallValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemoCall outside CallProvider");
  return v;
}
