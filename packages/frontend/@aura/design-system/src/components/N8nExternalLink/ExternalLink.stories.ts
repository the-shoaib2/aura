import type { StoryFn } from '@storybook/vue3-vite';

import N8nExternalLink from './ExternalLink.vue';

export default {
	title: 'Atoms/ExternalLink',
	component: N8nExternalLink,
	argTypes: {
		size: {
			control: 'select',
			options: ['small', 'medium', 'large'],
		},
		newWindow: {
			control: 'boolean',
		},
	},
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nExternalLink,
	},
	template: '<N8nExternalLink v-bind="args">{{ args.default }}</N8nExternalLink>',
});

export const IconOnly = Template.bind({});
IconOnly.args = {
	href: 'https://aura.io',
	size: 'medium',
	newWindow: true,
};

export const WithText = Template.bind({});
WithText.args = {
	href: 'https://aura.io',
	size: 'medium',
	newWindow: true,
	default: 'Visit aura',
};

export const Small = Template.bind({});
Small.args = {
	href: 'https://aura.io',
	size: 'small',
	newWindow: true,
	default: 'Visit aura',
};

export const Large = Template.bind({});
Large.args = {
	href: 'https://aura.io',
	size: 'large',
	newWindow: true,
	default: 'Visit aura',
};

export const SameWindow = Template.bind({});
SameWindow.args = {
	href: 'https://aura.io',
	size: 'medium',
	newWindow: false,
	default: 'Visit aura',
};

export const WithClickHandler = Template.bind({});
WithClickHandler.args = {
	size: 'medium',
	onClick: () => alert('Clicked!'),
	default: 'Click me',
};
