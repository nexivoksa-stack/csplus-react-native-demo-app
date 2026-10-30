import { describe, expect, it } from "vitest";
import { agentTone, friendly, stateTone } from "./present";

describe("presentation", () => {
  it("colours states by how worried to be", () => {
    expect(stateTone("connected")).toBe("ok");
    expect(stateTone("reconnecting")).toBe("warn");
    expect(stateTone("failed")).toBe("danger");
    expect(stateTone("idle")).toBe("muted");
    expect(agentTone("speaking")).toBe("ok");
    expect(agentTone("failed")).toBe("danger");
    expect(agentTone(null)).toBe("muted");
  });

  it("has a human sentence for every code the phone SDK can raise, and a fallback", () => {
    for (const code of ["mic_permission_denied", "no_mic", "audio_session_failed", "agent_never_joined", "concurrency_limit", "rate_limited", "app_not_allowed", "invalid_grant", "grant_unavailable", "connection_lost"]) {
      expect(friendly(code)).not.toBe(friendly("something_unmapped"));
    }
    expect(friendly("something_unmapped")).toMatch(/could not be started/);
  });
});
