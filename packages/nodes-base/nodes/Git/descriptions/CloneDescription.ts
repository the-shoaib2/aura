import type { INodeProperties } from 'workflow';

export const cloneFields: INodeProperties[] = [
	{
		displayName: 'Source Repository',
		name: 'sourceRepository',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['clone'],
			},
		},
		default: '',
		placeholder: 'https://github.com/aura-io/aura',
		description: 'The URL or path of the repository to clone',
		required: true,
	},
];
