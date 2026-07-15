import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Next.js's bundler resolves this to a no-op under the "react-server"
      // condition; Vitest has no such condition, so without this alias
      // *every* server-only-marked module (session.ts, cloudinary.ts, the AI
      // client, ...) throws on import in tests. Mirror the same no-op here.
      "server-only": path.resolve(__dirname, "./vitest.server-only-stub.ts"),
    },
  },
});
