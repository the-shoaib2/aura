import type { INodeProperties } from 'workflow';

const showOnlyForUserCreate = {
	operation: ['create'],
	resource: ['user'],
};

export const userCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForUserCreate,
		},
		description: 'The name of the user',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
];
