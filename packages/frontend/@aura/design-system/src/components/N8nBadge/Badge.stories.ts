import type { StoryFn } from '@storybook/vue3-vite';

import N8nBadge from './Badge.vue';

export default {
	title: 'Atoms/Badge',
	component: N8nBadge,
	argTypes: {
		theme: {
			type: 'text',
			options: ['default', 'primary', 'secondary', 'tertiary'],
		},
		size: {
			type: 'select',
			options: ['small', 'medium', 'large'],
		},
	},
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nBadge,
	},
	template: '<aura-badge v-bind="args">Badge</aura-badge>',
});

export const Badge = Template.bind({});
Badge.args = {};
