import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Preserved recovery material is not part of the active application.
    "_backup_pre_rebuild/**",
    "_to_delete/**",

    // Deployment reference files are documentation, not compiled source.
    "deploy/**",

    // Dormant provider retained temporarily until pronunciation is realigned.
    "lib/pronunciation/azure-speech.ts",
  ]),
]);

export default eslintConfig;
