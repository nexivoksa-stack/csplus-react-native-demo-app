import path from "node:path";
import { defineConfig } from "vitest/config";

// Only the pure logic in src/lib is tested here: it has no React Native in it
// on purpose. The screens are proven on a device (see README, "Test matrix").
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: { include: ["src/lib/**/*.test.ts", "server/**/*.test.mjs", "scripts/**/*.test.mjs"] },
});
