import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist", "node_modules", ".venv", "venv"],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  prettier,
];
