import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findCopies } from "./check-livekit-copies.mjs";

function tree(...dirs) {
  const root = mkdtempSync(path.join(tmpdir(), "lkc-"));
  for (const d of dirs) {
    const dir = path.join(root, d);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "livekit-client", version: d.includes("nested") ? "2.19.0" : "2.22.3" }));
  }
  return root;
}

describe("findCopies", () => {
  it("finds the single hoisted copy", () => {
    expect(findCopies(tree("node_modules/livekit-client"))).toEqual([{ path: "node_modules/livekit-client", version: "2.22.3" }]);
  });

  it("finds a nested second copy, including inside a scope", () => {
    const copies = findCopies(tree("node_modules/livekit-client", "node_modules/@csplus/client-core/node_modules/nested/livekit-client"));
    expect(copies).toHaveLength(2);
  });

  it("is empty when it is not installed", () => {
    expect(findCopies(tree())).toEqual([]);
  });
});
