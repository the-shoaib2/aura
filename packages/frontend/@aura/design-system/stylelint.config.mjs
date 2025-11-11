import { baseConfig } from '@aura/stylelint-config/base';

export default {
	...baseConfig,
	rules: {
		...baseConfig.rules,
		'@aura/css-var-naming': [true, { severity: 'error' }],
	},
};
