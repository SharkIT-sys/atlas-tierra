import tseslint from "typescript-eslint";
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "test-results/**"] },
  ...tseslint.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
);
