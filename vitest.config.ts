import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/schemaGen.ts"],
      thresholds: {
        "src/validate.ts": { lines: 95, functions: 80 },
        "src/model.ts": { lines: 90, functions: 90 },
      },
    },
  },
});
