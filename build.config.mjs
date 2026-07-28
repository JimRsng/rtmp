import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  failOnWarn: false,
  entries: [
    {
      input: "src/index.ts",
      outDir: "dist"
    }
  ]
});