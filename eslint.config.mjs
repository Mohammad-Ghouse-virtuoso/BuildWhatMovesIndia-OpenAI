import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);
