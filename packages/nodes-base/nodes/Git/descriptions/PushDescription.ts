import type { INodeProperties } from 'workflow';

export const pushFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		displayOptions: {
			show: {
				operation: ['push'],
			},
		},
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Branch',
				name: 'branch',
				type: 'string',
				default: '',
				placeholder: 'main',
				description:
					'The branch to switch to before pushing. If empty or not set, will push current branch.',
			},
			{
				displayName: 'Target Repository',
				name: 'targetRepository',
				type: 'string',
				default: '',
				placeholder: 'https://github.com/aura-io/aura',
				description: 'The URL or path of the repository to push to',
			},
		],
	},
];
