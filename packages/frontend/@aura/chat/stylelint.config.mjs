import { baseConfig } from '@aura/stylelint-config/base';

export default {
	...baseConfig,
	rules: {
		...baseConfig.rules,
		// Disable css-var-naming rule for chat package
		// Because most var names seem to be breaking
		// And it needs to continue to be backwards compatible
		// As users could be using it directly on websites and customizing css variables
		'@aura/css-var-naming': null,
	},
};
