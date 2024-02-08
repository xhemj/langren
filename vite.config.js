import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import legacy from "@vitejs/plugin-legacy";
import { visualizer } from "rollup-plugin-visualizer";

const plugins = [];

if (process.env.NODE_ENV === "production") {
  // 打包依赖展示;
  plugins.push(
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  // process.env.NODE_ENV === "production"
  //   ? "https://www.xhemj.work/langren/"
  //   : "./",
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        {
          "naive-ui": [
            // "useDialog",
            // "useMessage",
            // "useNotification",
            // "useLoadingBar",
          ],
        },
      ],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    ...plugins,
  ],
});
