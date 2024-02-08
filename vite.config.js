import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import legacy from "@vitejs/plugin-legacy";
import { visualizer } from "rollup-plugin-visualizer";
import * as child from "child_process";

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

const commitHash = child
  .execSync(
    "D:\\cmder\\vendor\\git-for-windows\\bin\\git.exe rev-parse --short HEAD"
  )
  .toString();

const buildDate = new Date().getTime();

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  // process.env.NODE_ENV === "production"
  //   ? "https://www.xhemj.work/langren/"
  //   : "./",
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
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
