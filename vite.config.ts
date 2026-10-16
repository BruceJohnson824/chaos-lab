import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "CHAOS_");
  const port = env.CHAOS_CORE_PORT || "8787";
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": `http://127.0.0.1:${port}`,
      },
    },
  };
});
