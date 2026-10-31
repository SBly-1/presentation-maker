import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/functions/**/*.ts"],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        functions: 100,
      },
    },
  },
});
