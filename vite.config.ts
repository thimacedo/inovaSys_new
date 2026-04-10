/**
 * @file vite.config.ts
 * @description Configuração Vite com correção de segurança:
 *   GEMINI_API_KEY removida do bundle cliente.
 *   Variáveis sensíveis pertencem exclusivamente ao servidor.
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo-inovasys.png"],
      manifest: {
        name: "InovaSys - Gestão Arbitral",
        short_name: "InovaSys",
        description: "Plataforma de Gestão Arbitral Enterprise",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        icons: [
          { src: "logo-inovasys.png", sizes: "192x192", type: "image/png" },
          { src: "logo-inovasys.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],

  // CORREÇÃO: Removido `define: { 'process.env.GEMINI_API_KEY': ... }`
  // Chaves de API não devem ser injetadas no bundle do cliente.
  // Use-as exclusivamente em Edge Functions ou no server.ts.
  // Variáveis VITE_* são as únicas seguras para o cliente (e apenas as não-sensíveis).

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
    },
  },
  // Configuração de Testes (Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts'],
    },
  },
});
