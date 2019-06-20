module.exports = {
  extends: 'google',
  parserOptions: {
    ecmaVersion: 6
  },
  env: {
    node: true
  },
  rules: {
    // Settings for Appsscript.
    'no-multi-str': 'off',
    'no-var': 'off',
    'comma-dangle': ['error', 'never'],
    // These should be turned on in the future
    'max-len': 'off',
    camelcase: 'off',
    'guard-for-in': 'off',
    'no-throw-literal': 'off',
    'no-unused-vars': 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'one-var': 'off',
    // Turned off because prettier manages this.
    quotes: 'off',
    indent: 'off',
    // Turned off because they don't matter.
    'quote-props': 'off',
    'new-cap': 'off',
    // Additional rules.
    curly: 'error'
  }
};
