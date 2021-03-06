/* eslint-disable quotes */
/* eslint-disable no-tabs */
module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"google",
		"plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["tsconfig.json", "tsconfig.dev.json"],
		sourceType: "module",
		tsconfigRootDir: __dirname,
	},
	ignorePatterns: [
		'/lib/**/*', // Ignore built files.
	],
	plugins: [
		'@typescript-eslint',
		"import",
	],
	rules: {
		"quotes": ["error", "single"],
		"indent": ["error", "tab"],
		'object-curly-spacing': ["error", "always"],
		"no-tabs": 0,
		"max-len": ["error", { "code": 160 }],
		"import/no-unresolved": 0,
		"require-jsdoc": 0,
	},
};
