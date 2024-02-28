import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteDevServer } from "vite";

const pluginWatchNodeModules = (modules: string[]) => {
  const pattern = `/node_modules\\/(?!${modules.join("|")}).*/`;

  return {
    name: "watch-node-modules",
    configureServer: (server: ViteDevServer): void => {
      server.watcher.options = {
        ...server.watcher.options,
        ignored: [new RegExp(pattern), "**/.git/**"],
      };
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), pluginWatchNodeModules(["@aragon/ods"])],

  resolve: {
    alias: {
      src: "/src",
    },
  },
});
