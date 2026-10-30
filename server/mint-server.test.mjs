import http from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHandler, pickGrantFields } from "./mint-server.mjs";

let server;
afterEach(() => server?.close());

async function start(opts) {
  server = http.createServer(createHandler(opts));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return (path, body, method = "POST") =>
    fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }).then(async (r) => ({ status: r.status, json: await r.json() }));
}

describe("pickGrantFields", () => {
  it("keeps the known fields and drops the rest", () => {
    expect(pickGrantFields({ agent_id: "a", lang: "ur", app_id: "x", metadata: { u: "1" }, secret: "no", public_key: "no" })).toEqual({
      agent_id: "a", lang: "ur", app_id: "x", metadata: { u: "1" },
    });
    expect(pickGrantFields({ agent_id: "", lang: 5, metadata: [1] })).toEqual({});
    expect(pickGrantFields(null)).toEqual({});
  });
});

describe("mint server", () => {
  it("holds the secret: asks CS+ with the Bearer key and returns only the grant", async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ call_grant: "real.jwt", expires_at: "t", internal: "x" }), { status: 201 }));
    const call = await start({ env: { CSPLUS_SECRET_KEY: "csp_sk_live_x", CSPLUS_API_BASE: "https://svc.example/" }, fetchImpl: upstream });
    const r = await call("/grant", { agent_id: "a", app_id: "ai.csplus.demo", evil: 1 });
    expect(r).toEqual({ status: 200, json: { call_grant: "real.jwt", expires_at: "t" } });
    const [url, init] = upstream.mock.calls[0];
    expect(url).toBe("https://svc.example/v1/web/call-grants");
    expect(init.headers.Authorization).toBe("Bearer csp_sk_live_x");
    expect(JSON.parse(init.body)).toEqual({ agent_id: "a", app_id: "ai.csplus.demo" });
  });

  it("never leaks the secret to the app, even in an error", async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ code: "invalid_key" }), { status: 401 }));
    const call = await start({ env: { CSPLUS_SECRET_KEY: "csp_sk_live_SECRET" }, fetchImpl: upstream });
    const r = await call("/grant", {});
    expect(r.status).toBe(502);
    expect(JSON.stringify(r.json)).not.toContain("SECRET");
    expect(r.json.message).toContain("invalid_key");
  });

  it("explains a missing secret instead of calling out", async () => {
    const upstream = vi.fn();
    const call = await start({ env: {}, fetchImpl: upstream });
    expect((await call("/grant", {})).status).toBe(500);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("reports an unreachable CS+ as a 502", async () => {
    const call = await start({ env: { CSPLUS_SECRET_KEY: "k" }, fetchImpl: async () => { throw new Error("ECONNREFUSED"); } });
    const r = await call("/grant", {});
    expect(r.status).toBe(502);
    expect(r.json.message).toContain("ECONNREFUSED");
  });

  it("hands out distinct fake grants in MINT_FAKE mode, without calling CS+", async () => {
    const upstream = vi.fn();
    const call = await start({ env: { MINT_FAKE: "1" }, fetchImpl: upstream });
    const a = await call("/grant", {});
    const b = await call("/grant", {});
    expect(a.json.call_grant).not.toBe(b.json.call_grant);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects bad JSON, other routes and oversized bodies", async () => {
    const call = await start({ env: { MINT_FAKE: "1" } });
    expect((await call("/grant", "{nope")).status).toBe(400);
    expect((await call("/other", {})).status).toBe(404);
    expect((await call("/grant", { pad: "x".repeat(5000) })).status).toBe(413);
  });
});
