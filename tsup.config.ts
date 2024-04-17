import { defineConfig } from "tsup";

export default defineConfig(() => {
  return {
    entry: ["src/index.ts"],
    outDir: "dist",
    minify: true,
    clean: true,
    format: ["cjs", "esm"],
    dts: true,
  };
});
