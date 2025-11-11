import type { StoryFn } from '@storybook/vue3-vite';

import N8nInputLabel from './InputLabel.vue';
import N8nInput from '../N8nInput';

export default {
	title: 'Atoms/Input Label',
	component: N8nInputLabel,
	argTypes: {},
	parameters: {
		backgrounds: { default: '--color--background--light-2' },
	},
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nInputLabel,
		N8nInput,
	},
	template: `<div style="margin-top:50px">
			<aura-input-label v-bind="args">
				<aura-input />
			</aura-input-label>
		</div>`,
});

export const InputLabel = Template.bind({});
InputLabel.args = {
	label: 'input label',
	tooltipText: 'more info...',
};
