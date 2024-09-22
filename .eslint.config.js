export default {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:svelte/recommended",
  ],
  plugins: ["@typescript-eslint"],
  ignorePatterns: [
    "*.cjs",
    ".DS_Store",
    "node_modules",
    "/build",
    "/.svelte-kit",
    "/package",
    ".env",
    ".env.*",
    "!.env.example",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
  ],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "prefer-const": "warn",
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
