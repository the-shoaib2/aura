import type { StoryFn } from '@storybook/vue3-vite';

import N8nCallout from './Callout.vue';
import N8nLink from '../N8nLink';
import N8nText from '../N8nText';

export default {
	title: 'Atoms/Callout',
	component: N8nCallout,
	argTypes: {
		theme: {
			control: {
				type: 'select',
			},
			options: ['info', 'secondary', 'success', 'warning', 'danger', 'custom'],
		},
		message: {
			control: {
				type: 'text',
			},
		},
		icon: {
			control: {
				type: 'text',
			},
		},
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/tPpJvbrnHbP8C496cYuwyW/Node-pinning?node-id=15%3A5777',
		},
	},
};

interface Args {
	theme: string;
	icon: string;
	default: string;
	actions: string;
	trailingContent: string;
}

const template: StoryFn<Args> = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nLink,
		N8nText,
		N8nCallout,
	},
	template: `
		<aura-callout v-bind="args">
			${args.default}
			<template #actions v-if="args.actions">
				${args.actions}
			</template>
			<template #trailingContent v-if="args.trailingContent">
				${args.trailingContent}
			</template>
		</aura-callout>
	`,
});

export const defaultCallout = template.bind({});
defaultCallout.args = {
	theme: 'success',
	default: `
		This is a default callout.
	`,
};

export const customCallout = template.bind({});
customCallout.args = {
	theme: 'custom',
	icon: 'git-branch',
	default: `
		This is a custom callout.
	`,
	actions: `
		<aura-link size="small">
			Do something!
		</aura-link>
	`,
};

export const secondaryCallout = template.bind({});
secondaryCallout.args = {
	theme: 'secondary',
	icon: 'pin',
	default: `
		This data is pinned.
	`,
	actions: `
		<aura-link theme="secondary" size="small" :bold="true" :underline="true">
			Unpin
		</aura-link>
	`,
	trailingContent: `
		<aura-link
			theme="secondary"
			size="small"
			:bold="true"
			:underline="true"
			to="https://aura.io"
		>
			Learn more
		</aura-link>
	`,
};
