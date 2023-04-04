import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
    plugins: [react(), eslint()],
    base: "/Blackjack-Game",
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./tests/setup.ts",
    },
});
