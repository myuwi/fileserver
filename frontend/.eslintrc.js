module.exports = {
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:react-hooks/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript'
	],
	'env': {
		'browser': true,
		'node': true,
		'es6': true,
		'commonjs': true
	},
	'parser': '@typescript-eslint/parser',
	'plugins': ['import', '@typescript-eslint'],
	'settings': {
		'react': {
			'version': 'detect'
		}
	},
	'rules': {
		'no-var': 2,
		'no-unused-vars': 0,
		'no-unused-labels': 1,
		'no-case-declarations': 0,
		'no-unreachable': 2,
		'object-curly-spacing': [2, 'always'],
		'prefer-const': 2,
		'quotes': [2, 'single'],
		'semi': [2, 'always'],
		'no-extra-semi': 2,
		'space-before-blocks': [2, 'always'],
		'keyword-spacing': [2, { 'before': true, 'after': true }],
		'yoda': 2,
		'strict': [2, 'never'],
		'arrow-body-style': 0,
		'arrow-parens': [2, 'always'],
		'no-inner-declarations': 0,
		'one-var': [2, 'never'],
		'no-useless-constructor': 2,
		'no-useless-rename': 2,
		'import/prefer-default-export': 0,
		'import/no-default-export': 2,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-unused-vars': 0,
		'jsx-a11y/anchor-is-valid': 0,
		'jsx-a11y/no-noninteractive-tabindex': 0,
		'jsx-a11y/no-static-element-interactions': 0,
		'jsx-a11y/click-events-have-key-events': 0,
		'jsx-a11y/media-has-caption': 0,
		'react/react-in-jsx-scope': 0
	}
};