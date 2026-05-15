import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  bundle: true,
  shims: true,
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
});
