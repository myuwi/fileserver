module.exports = {
	'extends': 'eslint:recommended',
	'env': {
		'node': true,
		'es6': true
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'sourceType': 'module',
		'ecmaVersion': 2020
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'no-var': 2,
		'no-unused-vars': 0,
		'no-unused-labels': 1,
		'no-case-declarations': 0,
		'no-unreachable': 2,
		'object-curly-spacing': [2, 'always'],
		'prefer-const': 1,
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
		'no-useless-rename': 2
	}
};