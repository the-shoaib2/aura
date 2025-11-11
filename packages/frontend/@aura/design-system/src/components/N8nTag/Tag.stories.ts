import type { StoryFn } from '@storybook/vue3-vite';

import N8nTag from './Tag.vue';

export default {
	title: 'Atoms/Tag',
	component: N8nTag,
	argTypes: {
		text: {
			control: {
				control: 'text',
			},
		},
	},
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nTag,
	},
	template: '<aura-tag v-bind="args"></aura-tag>',
});

export const Tag = Template.bind({});
Tag.args = {
	text: 'tag name',
};
