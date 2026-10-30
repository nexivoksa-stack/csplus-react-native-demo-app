import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, configProblems, parseConfig } from "./config";

describe("parseConfig", () => {
  it.each([null, "", "not json", "null", "5", '"x"'])("falls back to defaults for %j", (raw) => {
    expect(parseConfig(raw)).toEqual(DEFAULT_CONFIG);
  });

  it("round-trips a saved config", () => {
    const saved = { ...DEFAULT_CONFIG, mode: "signed" as const, publicKey: "k", agentId: "a", background: "end" as const };
    expect(parseConfig(JSON.stringify(saved))).toEqual(saved);
  });

  it("keeps defaults for missing or mistyped fields, and ignores unknown ones", () => {
    const c = parseConfig(JSON.stringify({ mode: "bogus", publicKey: 5, lang: "ur", extra: true, background: "x" }));
    expect(c).toMatchObject({ mode: "publishable", publicKey: "", lang: "ur", background: "continue" });
    expect(c).not.toHaveProperty("extra");
  });
});

describe("configProblems", () => {
  it("needs a key in publishable mode", () => {
    expect(configProblems(DEFAULT_CONFIG)).toEqual(["Enter a publishable key."]);
    expect(configProblems({ ...DEFAULT_CONFIG, publicKey: " csp_pk_live_x " })).toEqual([]);
  });

  it("needs a mint URL in signed mode, and not a key", () => {
    expect(configProblems({ ...DEFAULT_CONFIG, mode: "signed", mintUrl: "" })).toHaveLength(1);
    expect(configProblems({ ...DEFAULT_CONFIG, mode: "signed" })).toEqual([]);
  });

  it("rejects a token endpoint that is not an http(s) URL", () => {
    expect(configProblems({ ...DEFAULT_CONFIG, publicKey: "k", tokenEndpoint: "api.csplus.ai" })).toHaveLength(1);
    expect(configProblems({ ...DEFAULT_CONFIG, publicKey: "k", tokenEndpoint: "https://staging.example/v1/web/token" })).toEqual([]);
  });
});
