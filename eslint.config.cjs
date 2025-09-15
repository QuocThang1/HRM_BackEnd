// eslint.config.cjs
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs", // ⚡ CommonJS (require/module.exports)
      globals: {
        console: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "error",
      "no-unused-vars": "warn",
    },
  },
];
