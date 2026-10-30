// A ~60-line stand-in for "your backend", for testing signed mode.
//
// The app asks THIS server for a call grant; this server asks CS+ with the
// SECRET key, which therefore never enters the app bundle. A real app does the
// same from its own backend, behind its own user authentication -- this demo
// has none, so run it on a trusted network only.
//
//   CSPLUS_SECRET_KEY=csp_sk_live_...  node server/mint-server.mjs
//   MINT_FAKE=1                        node server/mint-server.mjs   (no CS+ call)
//
// NOTE: POST /v1/web/call-grants is specified in CSPLUS_REACT_NATIVE_SDK_PLAN.md
// section 7.4 and is NOT built in csplus-agent-service yet. Against today's
// service the real mode gets a 404. MINT_FAKE=1 exercises the app's plumbing only;
// a fake grant is refused by the token endpoint.
import http from "node:http";
import { pathToFileURL } from "node:url";

const MAX_BODY = 4096;

/** The fields a call grant may be minted with; anything else the app sends is dropped. */
export function pickGrantFields(body) {
  const out = {};
  for (const k of ["agent_id", "lang", "app_id", "participant_name"]) {
    if (typeof body?.[k] === "string" && body[k]) out[k] = body[k];
  }
  if (body?.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)) out.metadata = body.metadata;
  return out;
}

export function createHandler({ env = process.env, fetchImpl = fetch } = {}) {
  let n = 0;
  const send = (res, status, json) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(json));
  };
  return async function handle(req, res) {
    if (req.method !== "POST" || req.url !== "/grant") return send(res, 404, { message: "POST /grant" });

    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > MAX_BODY) return send(res, 413, { message: "body too large" });
    }
    let body;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return send(res, 400, { message: "body must be JSON" });
    }
    const fields = pickGrantFields(body);

    if (env.MINT_FAKE === "1") return send(res, 200, { call_grant: `fake.grant.${++n}`, fake: true });

    const secret = env.CSPLUS_SECRET_KEY;
    if (!secret) return send(res, 500, { message: "CSPLUS_SECRET_KEY is not set" });
    const base = (env.CSPLUS_API_BASE || "https://api.csplus.ai").replace(/\/$/, "");
    try {
      const upstream = await fetchImpl(`${base}/v1/web/call-grants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify(fields),
      });
      const json = await upstream.json().catch(() => ({}));
      if (!upstream.ok || typeof json.call_grant !== "string") {
        return send(res, 502, { message: `CS+ refused the grant (HTTP ${upstream.status}${json.code ? `, ${json.code}` : ""})` });
      }
      return send(res, 200, { call_grant: json.call_grant, expires_at: json.expires_at });
    } catch (err) {
      return send(res, 502, { message: `could not reach CS+: ${err instanceof Error ? err.message : String(err)}` });
    }
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const port = Number(process.env.PORT || 8787);
  http.createServer(createHandler()).listen(port, "0.0.0.0", () => {
    console.log(`mint server on :${port}  (${process.env.MINT_FAKE === "1" ? "FAKE grants" : "CS+ " + (process.env.CSPLUS_API_BASE || "https://api.csplus.ai")})`);
  });
}
