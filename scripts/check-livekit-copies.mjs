// Two copies of livekit-client in one app double its size and split its state
// (CSPLUS_REACT_NATIVE_SDK_PLAN.md section 6.5). Walk node_modules and count.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function findCopies(root) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 8) return;
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of names) {
      const full = path.join(dir, name);
      if (name === "livekit-client") {
        const manifest = path.join(full, "package.json");
        if (existsSync(manifest)) {
          const j = JSON.parse(readFileSync(manifest, "utf8"));
          if (j.name === "livekit-client") found.push({ path: path.relative(root, full), version: j.version });
          continue;
        }
      }
      if (name.startsWith(".") && name !== ".bin") continue;
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory() && (name === "node_modules" || name.startsWith("@") || dir.endsWith("node_modules") || dir.includes(`${path.sep}node_modules${path.sep}`))) walk(full, depth + 1);
    }
  };
  walk(path.join(root, "node_modules"), 0);
  return found;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const copies = findCopies(process.cwd());
  if (copies.length === 1) {
    console.log(`ok: one livekit-client (${copies[0].version})`);
  } else {
    console.error(`FAIL: ${copies.length} copies of livekit-client:\n` + copies.map((c) => `  ${c.version}  ${c.path}`).join("\n"));
    process.exit(1);
  }
}
