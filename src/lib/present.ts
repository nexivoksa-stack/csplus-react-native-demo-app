import type { AgentState, CallState } from "@csplus/react-native";

type Tone = "muted" | "ok" | "warn" | "danger";

export function stateTone(state: CallState | "idle"): Tone {
  switch (state) {
    case "connected":
      return "ok";
    case "connecting":
    case "reconnecting":
      return "warn";
    case "failed":
      return "danger";
    default:
      return "muted";
  }
}

export function agentTone(state: AgentState | null): Tone {
  if (state === "speaking" || state === "listening" || state === "thinking") return "ok";
  if (state === "failed") return "danger";
  return "muted";
}

/** What a person should read for each code. Mirrors the docs' error guide. */
export function friendly(code: string): string {
  switch (code) {
    case "mic_permission_denied":
      return "We need the microphone. Allow it in Settings, then try again.";
    case "no_mic":
      return "No usable microphone was found.";
    case "audio_session_failed":
      return "The phone could not start audio. Close other audio apps and retry.";
    case "agent_never_joined":
      return "Nobody picked up. Try again in a moment.";
    case "concurrency_limit":
      return "All lines are busy right now.";
    case "rate_limited":
      return "Too many attempts. Wait a moment.";
    case "app_not_allowed":
      return "This app's id is not allowed for this key.";
    case "invalid_grant":
    case "grant_unavailable":
      return "Could not get permission to start the call (signed mode).";
    case "connection_lost":
    case "connection_failed":
    case "token_endpoint_unreachable":
      return "The connection failed. Check the network and retry.";
    default:
      return "The call could not be started.";
  }
}
