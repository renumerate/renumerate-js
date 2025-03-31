// @ts-check

import eslint from "@eslint/js";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import * as importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,

  {
    name: "renumerate/js",
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    ignores: ["!lib/**"],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
        ecmaFeatures: {
          jsx: true,
        },
        globals: {
          ...globals.browser,
        },
      },
    },

    extends: [
      importPlugin.flatConfigs?.recommended,
      importPlugin.flatConfigs?.typescript,
      importPlugin.flatConfigs?.react,
    ],

    plugins: {
      // @ts-expect-error The eslint-plugin-react-hooks package is behind the times.
      "react-hooks": reactHooks,
      react,
      "no-relative-import-paths": noRelativeImportPaths,
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          project: ["tsconfig.json"],
        },
      },
    },

    rules: {
      // React rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": [
        "error",
        {
          additionalHooks: "(useDidMountEffect)",
        },
      ],

      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],

      // Import rules
      "import/no-default-export": "error",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-loss-of-precision": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/only-throw-error": ["error"],

      // Regex rules
      "no-misleading-character-class": "error",
      "no-useless-backreference": "error",

      // General rules
      "no-compare-neg-zero": "error",
      "no-dupe-else-if": "error",
      "no-unsafe-negation": "error",
      "use-isnan": "error",
      "no-console": ["error", { allow: ["warn", "error", "info"] }],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
