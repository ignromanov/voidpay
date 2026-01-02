import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginNext from '@next/eslint-plugin-next'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginImport from 'eslint-plugin-import'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/out/',
      '**/build/',
      '**/dist/',
      '**/coverage/',
      '**/*.min.js',
      '**/.claude/',
      '**/next-env.d.ts',
      '**/.tsbuild/',
      'worktrees/**',
      'assets/**',
      'specs/**',
      '.ai/**',
    ],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // React config (JSX runtime)
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@next/next': pluginNext,
      'jsx-a11y': pluginJsxA11y,
      import: pluginImport,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules (from eslint-plugin-react/recommended)
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/prop-types': 'off', // Using TypeScript
      'react/no-unknown-property': 'off', // Next.js uses custom props
      'react/jsx-no-target-blank': 'off',

      // React Hooks rules
      ...pluginReactHooks.configs.recommended.rules,

      // Next.js rules (recommended + core-web-vitals)
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,

      // Import rules
      'import/no-anonymous-default-export': 'warn',

      // Accessibility rules
      'jsx-a11y/alt-text': [
        'warn',
        {
          elements: ['img'],
          img: ['Image'],
        },
      ],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',

      // General rules
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },

  // Allow console in scripts (CLI tools)
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Relaxed rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    rules: {
      // Allow any in tests (mocks, stubs, partial objects)
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused vars in tests (setup variables, destructuring)
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow non-null assertions in tests (we know test data structure)
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow empty functions in tests (mock implementations)
      '@typescript-eslint/no-empty-function': 'off',
      // Allow require imports in tests (dynamic imports for mocks)
      '@typescript-eslint/no-require-imports': 'off',
      // Allow console in tests (debugging)
      'no-console': 'off',
    },
  },
]

export default config
