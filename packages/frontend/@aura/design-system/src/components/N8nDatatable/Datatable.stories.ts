import type { StoryFn } from '@storybook/vue3-vite';

import { rows, columns } from './__tests__/data';
import N8nDatatable from './Datatable.vue';

export default {
	title: 'Atoms/Datatable',
	component: N8nDatatable,
};

export const Default: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nDatatable,
	},
	template: '<aura-datatable v-bind="args"></aura-datatable>',
});

Default.args = {
	columns,
	rows,
};
