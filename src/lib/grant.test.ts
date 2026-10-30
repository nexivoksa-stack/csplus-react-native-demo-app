import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG } from "./config";
import { makeGrantFetcher, type Fetch } from "./grant";

const ok = (body: unknown): ReturnType<Fetch> => Promise.resolve({ ok: true, status: 200, json: async () => body });

describe("makeGrantFetcher", () => {
  const cfg = { ...DEFAULT_CONFIG, mintUrl: "http://host:8787/", agentId: " a1 ", lang: "ur", appId: "ai.csplus.demo" };

  it("asks the mint server for a grant carrying the agent, language and app id", async () => {
    const f = vi.fn<Fetch>(() => ok({ call_grant: "g.jwt" }));
    await expect(makeGrantFetcher(cfg, f)()).resolves.toBe("g.jwt");
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe("http://host:8787/grant");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ agent_id: "a1", lang: "ur", app_id: "ai.csplus.demo" });
  });

  it("sends only what is set", async () => {
    const f = vi.fn<Fetch>(() => ok({ call_grant: "g" }));
    await makeGrantFetcher({ ...cfg, agentId: "", lang: "", appId: "" }, f)();
    expect(JSON.parse(f.mock.calls[0]![1].body)).toEqual({});
  });

  it("asks again on every call: a grant works once", async () => {
    const f = vi.fn<Fetch>(() => ok({ call_grant: "g" }));
    const get = makeGrantFetcher(cfg, f);
    await get();
    await get();
    expect(f).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["a refusal", () => Promise.resolve({ ok: false, status: 502, json: async () => ({ message: "upstream" }) })],
    ["no grant in the body", () => ok({})],
    ["an empty grant", () => ok({ call_grant: "" })],
    ["a body that is not JSON", () => Promise.resolve({ ok: true, status: 200, json: async () => { throw new Error("bad json"); } })],
  ])("throws on %s", async (_n, f) => {
    await expect(makeGrantFetcher(cfg, f as Fetch)()).rejects.toThrowError(/did not return a grant/);
  });

  it("reports the server's message when it gives one", async () => {
    const f: Fetch = () => Promise.resolve({ ok: false, status: 401, json: async () => ({ message: "bad secret" }) });
    await expect(makeGrantFetcher(cfg, f)()).rejects.toThrowError(/bad secret/);
  });
});
