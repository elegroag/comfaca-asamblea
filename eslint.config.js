import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                $: 'readonly',
                jQuery: 'readonly',
                _: 'readonly',
                Backbone: 'readonly',
                Noty: 'readonly',
                Swal: 'readonly',
                bootstrap: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-const': 'error',
            '@typescript-eslint/no-var-requires': 'error',
            
            // General JavaScript rules
            'no-unused-vars': 'off', // Handled by TypeScript
            'no-console': 'off',
            'no-debugger': 'warn',
            'no-alert': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'brace-style': ['error', '1tbs'],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', 'never'],
            'keyword-spacing': 'error',
            'space-infix-ops': 'error',
            'eol-last': 'error',
            'no-trailing-spaces': 'error',
            
            // jQuery/Backbone specific
            'no-undef': 'off', // jQuery and Backbone globals
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                $: 'readonly',
                jQuery: 'readonly',
                _: 'readonly',
                Backbone: 'readonly',
                Noty: 'readonly',
                Swal: 'readonly',
                bootstrap: 'readonly',
                require: 'readonly',
                module: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'no-debugger': 'warn',
            'no-alert': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'brace-style': ['error', '1tbs'],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', 'never'],
            'keyword-spacing': 'error',
            'space-infix-ops': 'error',
            'eol-last': 'error',
            'no-trailing-spaces': 'error',
            'no-undef': 'off', // jQuery and Backbone globals
        },
    },
    {
        ignores: [
            'node_modules/**',
            'vendor/**',
            'public/build/**',
            '*.min.js',
            'dist/**',
        ],
    },
];