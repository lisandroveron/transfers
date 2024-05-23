import jsdoc from "eslint-plugin-jsdoc";

const config = [
  jsdoc.configs["flat/recommended"],
  {
    ignores: ["controllers/handlers.js"]
  },
  {
    plugins: {jsdoc},
    settings: {
      jsdoc: {
        "tagNamePreference": {
          "file": "fileoverview",
          "returns": "return"
        }
      }
    }
  }
];

export default [
  {
    name: "Express Eslint",
    rules: {
      indent: ["error", 2, {
        SwitchCase: 1,
        ignoredNodes: ["JSXAttribute", "JSXSpreadAttribute"],
        ObjectExpression: "first",
        ArrayExpression: "first",
        FunctionDeclaration: {parameters: "first"},
        FunctionExpression: {parameters: "first"},
        CallExpression: {arguments: "off"},
      }],
      quotes: ["error", "double", {allowTemplateLiterals: true}],
      semi: ["error", "always"],
      "arrow-parens": ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "no-extra-semi": "off",
      "no-unused-vars": "error",
    },
  },
  {
    ignores: ["docs/**/*"]
  },
  ...config
];
