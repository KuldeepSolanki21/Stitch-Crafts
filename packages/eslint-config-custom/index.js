module.exports = {
  extends: ["eslint:recommended", "prettier"],
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2022
  }
};
