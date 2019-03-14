module.exports = {
  extends: 'google',
  parserOptions: {
    ecmaVersion: 6
  },
  env: {
    node: true
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    // This should be turned on in the future. // 'max-len': ['error', {code: 100}],
    'max-len': 'off',
    camelcase: 'off',
    // This should be turned on in the future
    eqeqeq: 'off',
    'guard-for-in': 'off',
    'no-var': 'off',
    'no-unused-vars': 'off',
    indent: 'off',
    'require-jsdoc': 'off',
    // This should be turned on in the future
    'valid-jsdoc': 'off',
    // This should be turned on in the future
    'one-var': 'off',
    // Turned off because prettier manages this
    quotes: 'off'
  }
};
