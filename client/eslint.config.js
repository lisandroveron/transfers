import react from "eslint-plugin-react";

export default [{
  name: "React Eslint",
  files: ["**/*.{js,jsx}"],
  plugins: {
    react: react
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {jsx: true}
    },
  },
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
    "react/boolean-prop-naming": "error",
    "react/hook-use-state": "error",
    // "react/jsx-closing-tag-location": "error",
    "react/jsx-equals-spacing": [0, "always"],
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "react/jsx-indent": ["error", 2],
    "react/jsx-indent-props": ["error", {
      indentMode: 4,
      ignoreTernaryOperator: true
    }],
    "react/jsx-key": ["error", {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
      warnOnDuplicates: true,
    }],
    "react/jsx-uses-vars": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
  },
}];
