import type { INodeProperties } from 'workflow';

export const sharedProperties: INodeProperties[] = [
	{
		// eslint-disable-next-line aura-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Table Name',
		name: 'tableName',
		type: 'options',
		placeholder: 'Select a table',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTableNames',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.aura.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['row'],
			},
		},
	},
	{
		// eslint-disable-next-line aura-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Row ID',
		name: 'rowId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.aura.io/code/expressions/">expression</a>',
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getRowIds',
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['row'],
			},
			hide: {
				operation: ['create', 'list', 'search'],
			},
		},
	},
];
