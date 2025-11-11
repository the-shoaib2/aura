import type { StoryFn } from '@storybook/vue3-vite';
import { ElMenu } from 'element-plus';

import N8nMenuItem from '.';

export default {
	title: 'Atoms/MenuItem',
	component: N8nMenuItem,
};

const template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		ElMenu,
		N8nMenuItem,
	},
	template: `
		<div style="width: 200px">
			<el-menu>
				<aura-menu-item v-bind="args" />
			</el-menu>
		</div>
	`,
});

export const defaultMenuItem = template.bind({});
defaultMenuItem.args = {
	item: {
		id: 'workflows',
		icon: 'home',
		label: 'Workflows',
	},
};

export const withSecondaryIcon = template.bind({});
withSecondaryIcon.args = {
	item: {
		id: 'workflows',
		icon: 'home',
		label: 'Workflows',
		secondaryIcon: { name: 'lock', size: 'small' },
	},
};

export const withSecondaryIconTooltip = template.bind({});
withSecondaryIconTooltip.args = {
	item: {
		id: 'workflows',
		icon: 'home',
		label: 'Workflows',
		secondaryIcon: {
			name: 'lock',
			size: 'small',
			tooltip: {
				content: 'Locked secret',
				bindTo: 'secondaryIcon',
			},
		},
	},
};

export const compact = template.bind({});
compact.args = {
	item: {
		id: 'compact',
		icon: 'ice-cream',
		label: 'Click here',
	},
	compact: true,
};

export const link = template.bind({});
link.args = {
	item: {
		id: 'website',
		icon: 'globe',
		label: 'Website',
		link: {
			href: 'https://www.aura.io',
			target: '_blank',
		},
	},
};

export const withChildren = template.bind({});
withChildren.args = {
	item: {
		id: 'help',
		icon: 'question',
		label: 'Help',
		children: [
			{ icon: 'info', label: 'About aura', id: 'about' },
			{ icon: 'book', label: 'Documentation', id: 'docs' },
			{
				id: 'quickstart',
				icon: 'video',
				label: 'Quickstart',
				link: {
					href: 'https://www.youtube.com/watch?v=RpjQTGKm-ok',
					target: '_blank',
				},
			},
		],
	},
};
