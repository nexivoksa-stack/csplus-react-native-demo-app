/**
 * Signed mode: ask the demo's own backend (server/mint-server.mjs) for a call
 * grant. The secret key lives only on that server, never in this bundle -- which
 * is the whole point of the mode, and the pattern a real app should copy.
 */
import type { DemoConfig } from "./config";

export type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export function makeGrantFetcher(c: Pick<DemoConfig, "mintUrl" | "agentId" | "lang" | "appId">, fetchImpl: Fetch = fetch as unknown as Fetch) {
  return async function getGrant(): Promise<string> {
    const body: Record<string, string> = {};
    if (c.agentId.trim()) body.agent_id = c.agentId.trim();
    if (c.lang.trim()) body.lang = c.lang.trim();
    if (c.appId.trim()) body.app_id = c.appId.trim();
    const res = await fetchImpl(`${c.mintUrl.trim().replace(/\/$/, "")}/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { call_grant?: unknown; message?: unknown } | null;
    if (!res.ok || typeof json?.call_grant !== "string" || !json.call_grant) {
      const why = typeof json?.message === "string" ? json.message : `HTTP ${res.status}`;
      throw new Error(`The mint server did not return a grant (${why}).`);
    }
    return json.call_grant;
  };
}
