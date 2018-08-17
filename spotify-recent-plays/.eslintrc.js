module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jest/globals": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2017
  },
  "plugins": ["jest"],
  "rules": {
    "array-bracket-spacing": 2,
    "arrow-spacing": 2,
    "camelcase": [ "error", { "properties": "never" } ],
    "comma-style": 2,
    "comma-spacing": ["error", { "before": false, "after": true }],
    "curly": [ 2, "all" ],
    "eol-last": 2,
    "indent": [ "error", 2 ],
    "key-spacing": 2,
    "keyword-spacing": 2,
    "no-console": 0,
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "object-curly-spacing": [ 2, "always" ],
    "padded-blocks": ["error", "never"],
    "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }],
    "semi": [ 2, "always" ],
    "space-before-blocks": 2,
    "space-in-parens": 2,
    "space-infix-ops": 2
  }
};
