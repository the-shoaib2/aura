import type { StoryFn } from '@storybook/vue3-vite';

import N8nCard from './Card.vue';
import N8nButton from '../N8nButton/Button.vue';
import N8nIcon from '../N8nIcon/Icon.vue';
import N8nText from '../N8nText/Text.vue';

export default {
	title: 'Atoms/Card',
	component: N8nCard,
};

export const Default: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
	},
	template: '<aura-card v-bind="args">This is a card.</aura-card>',
});

export const Hoverable: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
		N8nIcon,
		N8nText,
	},
	template: `<div style="width: 140px; text-align: center;">
		<aura-card v-bind="args">
			<aura-icon icon="plus" size="xlarge" />
			<aura-text size="large" class="mt-2xs">Add</aura-text>
		</aura-card>
	</div>`,
});

Hoverable.args = {
	hoverable: true,
};

export const WithSlots: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nCard,
		N8nButton,
		N8nIcon,
		N8nText,
	},
	template: `<aura-card v-bind="args">
		<template #prepend>
			<aura-icon icon="check" size="large" />
		</template>
		<template #header>
			<strong>Card header</strong>
		</template>
		<aura-text color="text-light" size="medium" class="mt-2xs mb-2xs">
			This is the card body.
		</aura-text>
		<template #footer>
			<aura-text size="medium">
				Card footer
			</aura-text>
		</template>
		<template #append>
			<aura-button>Click me</aura-button>
		</template>
	</aura-card>`,
});
