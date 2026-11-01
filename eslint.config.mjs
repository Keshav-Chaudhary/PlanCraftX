import nextPlugin from '@next/eslint-plugin-next';
import securityPlugin from 'eslint-plugin-security';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import boundariesPlugin from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.firebase/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'reports/**',
      'PromptWars_Challenge1_Exclusive/**',
      'next-env.d.ts',
      '**/*.d.ts',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      security: securityPlugin,
      'jsx-a11y': jsxA11yPlugin,
      boundaries: boundariesPlugin,
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'lib/domain/**' },
        { type: 'schemas', pattern: 'lib/schemas/**' },
        { type: 'result', pattern: 'lib/result/**' },
        { type: 'config', pattern: 'lib/config/**' },
        { type: 'security', pattern: 'lib/security/**' },
        { type: 'http', pattern: 'lib/http/**' },
        { type: 'api-clients', pattern: 'lib/api-clients/**' },
        { type: 'prompts', pattern: 'lib/prompts/**' },
        { type: 'features', pattern: 'features/**' },
        { type: 'app', pattern: 'app/**' },
      ],
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...securityPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,

      '@next/next/no-html-link-for-pages': 'off',

      // Absolute Rule: Ban unapproved console logging in application code
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Strict TypeScript guards: no any, no non-null assertions, no ts-ignore
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Complexity & max lines bounds
      complexity: ['error', 10],
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],

      // Architecture boundaries enforcement:
      // Domain logic must never import UI (features, app) or network clients (api-clients)
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'domain' } },
              disallow: [
                { to: { element: { type: 'features' } } },
                { to: { element: { type: 'app' } } },
                { to: { element: { type: 'api-clients' } } },
                { to: { element: { type: 'security' } } },
                { to: { element: { type: 'http' } } },
              ],
              message:
                'Domain logic must be pure and never import features, app routes, API clients, security, or HTTP modules.',
            },
            {
              from: { element: { type: 'schemas' } },
              disallow: [
                { to: { element: { type: 'features' } } },
                { to: { element: { type: 'app' } } },
                { to: { element: { type: 'api-clients' } } },
                { to: { element: { type: 'domain' } } },
                { to: { element: { type: 'security' } } },
                { to: { element: { type: 'http' } } },
              ],
              message:
                'Schemas must be pure definitions without dependencies on domain, UI, security, or HTTP modules.',
            },
            {
              from: { element: { type: 'security' } },
              disallow: [
                { to: { element: { type: 'features' } } },
                { to: { element: { type: 'app' } } },
                { to: { element: { type: 'domain' } } },
                { to: { element: { type: 'api-clients' } } },
              ],
              message: 'Security modules must not import UI, domain, or API client layers.',
            },
            {
              from: { element: { type: 'http' } },
              disallow: [
                { to: { element: { type: 'features' } } },
                { to: { element: { type: 'app' } } },
                { to: { element: { type: 'domain' } } },
                { to: { element: { type: 'api-clients' } } },
              ],
              message: 'HTTP modules must not import UI, domain, or API client layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,ts}'],
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-unsafe-regex': 'off',
    },
  },
);
