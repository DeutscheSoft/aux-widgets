export default [
  {
    rules: {
      'prefer-const': 'error',
      'no-unused-vars': [
        'error',
        { vars: 'all', args: 'none', ignoreRestSiblings: false },
      ],
      'no-var': 'error',
      semi: 'error',
    },
    ignores: [
      'testsuite/**/*.js',
      'backstop/**/*.js',
      'cypress/**/*.js',
      'doc/**/*.js',
    ],
  },
];
