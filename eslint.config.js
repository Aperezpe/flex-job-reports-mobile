import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint-define-config"; // Import for flat config system

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  // TypeScript recommended settings (optional)
  ...tseslint.configs.recommended,
  // Optionally, include React linting rules if needed
  // pluginReact.configs.flat.recommended,

  // Global settings for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "unused-imports": unusedImports, // Correct plugin object format
    },
    rules: {
      // Enable the rule to check for unused imports
      "unused-imports/no-unused-imports": "warn", // Set to "warn" or "error"
      "@typescript-eslint/no-explicit-any": "off", // Disable the 'any' rule globally
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false,
        },
      ],
    },
  },

  // Disable @typescript-eslint/no-var-requires for jestSetupFile.js
  {
    files: ["**/jestSetupFile.js"], // Path to your Jest setup file
    rules: {
      "@typescript-eslint/no-var-requires": "off", // Disable `require` in Jest setup file
      "@typescript-eslint/no-require-imports": "off"
    },
  },
]);
