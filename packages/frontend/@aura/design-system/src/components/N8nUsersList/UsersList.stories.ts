import type { StoryFn } from '@storybook/vue3-vite';
import { action } from 'storybook/actions';

import type { IUser } from '@aura/design-system/types';

import N8nUsersList from './UsersList.vue';

export default {
	title: 'Modules/UsersList',
	component: N8nUsersList,
	argTypes: {},
	parameters: {
		backgrounds: { default: '--color--background--light-2' },
	},
};

const methods = {
	action: ({ action: actionName }: { action: string; userId: string }) => action(actionName),
};

const Template: StoryFn = (args, { argTypes }) => ({
	setup: () => ({ args }),
	props: Object.keys(argTypes),
	components: {
		N8nUsersList,
	},
	template: '<aura-users-list v-bind="args" :actions="actions" @action="action" />',
	methods,
});

export const UsersList = Template.bind({});
UsersList.args = {
	actions: [
		{
			label: 'Resend Invite',
			value: 'reinvite',
			guard: (user: IUser) => !user.firstName,
		},
		{
			label: 'Delete User',
			value: 'delete',
		},
	],
	users: [
		{
			id: '1',
			firstName: 'Sunny',
			lastName: 'Side',
			fullName: 'Sunny Side',
			email: 'sunny@aura.io',
			isDefaultUser: false,
			isPendingUser: false,
			isOwner: true,
			signInType: 'email',
			disabled: false,
		},
		{
			id: '2',
			firstName: 'Kobi',
			lastName: 'Dog',
			fullName: 'Kobi Dog',
			email: 'kobi@aura.io',
			isDefaultUser: false,
			isPendingUser: false,
			isOwner: false,
			signInType: 'ldap',
			disabled: true,
		},
		{
			id: '3',
			email: 'invited@aura.io',
			isDefaultUser: false,
			isPendingUser: true,
			isOwner: false,
		},
	],
	currentUserId: '1',
};
