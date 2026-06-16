import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["src/components/**", "node_modules/**"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/actions/**"],
      exclude: ["src/components/**", "node_modules/**"],
    },
  },
});
