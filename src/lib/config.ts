/**
 * What the Config screen edits. Plain data plus pure helpers, so the rules
 * (what makes a config usable, how it round-trips through storage) are tested
 * without a device.
 */
export type AuthMode = "publishable" | "signed";

export interface DemoConfig {
  mode: AuthMode;
  /** csp_pk_live_... -- publishable mode. */
  publicKey: string;
  /** Empty = the SDK's production default. */
  tokenEndpoint: string;
  agentId: string;
  lang: string;
  /** Declared by the app, not proven; see the SDK plan, section 7.3. */
  appId: string;
  /** Base URL of server/mint-server.mjs -- signed mode. */
  mintUrl: string;
  background: "continue" | "end";
}

export const DEFAULT_CONFIG: DemoConfig = {
  mode: "publishable",
  publicKey: "",
  tokenEndpoint: "",
  agentId: "",
  lang: "",
  appId: "ai.csplus.demo",
  mintUrl: "http://10.0.2.2:8787", // the Android emulator's name for the host machine
  background: "continue",
};

export const STORAGE_KEY = "csplus-demo-config-v1";

/** Defaults for anything missing or of the wrong type; ignores unknown keys. */
export function parseConfig(raw: string | null): DemoConfig {
  if (!raw) return { ...DEFAULT_CONFIG };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
  if (!value || typeof value !== "object") return { ...DEFAULT_CONFIG };
  const v = value as Record<string, unknown>;
  const str = (k: keyof DemoConfig): string => (typeof v[k] === "string" ? (v[k] as string) : (DEFAULT_CONFIG[k] as string));
  return {
    mode: v.mode === "signed" ? "signed" : "publishable",
    publicKey: str("publicKey"),
    tokenEndpoint: str("tokenEndpoint"),
    agentId: str("agentId"),
    lang: str("lang"),
    appId: str("appId"),
    mintUrl: str("mintUrl"),
    background: v.background === "end" ? "end" : "continue",
  };
}

/** What stops a call from being attempted, in the words shown on screen. */
export function configProblems(c: DemoConfig): string[] {
  const out: string[] = [];
  if (c.mode === "publishable" && !c.publicKey.trim()) out.push("Enter a publishable key.");
  if (c.mode === "signed" && !/^https?:\/\//.test(c.mintUrl.trim())) out.push("Enter the mint server URL (http://…).");
  if (c.tokenEndpoint.trim() && !/^https?:\/\//.test(c.tokenEndpoint.trim())) out.push("The token endpoint must start with http:// or https://.");
  return out;
}
