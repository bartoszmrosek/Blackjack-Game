import { defineConfig } from "vitest/config";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
    plugins: [react(), eslint(), basicSsl()],
    base: "/Blackjack-Game",
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./tests/setup.ts",
        restoreMocks: true,
    },
});
