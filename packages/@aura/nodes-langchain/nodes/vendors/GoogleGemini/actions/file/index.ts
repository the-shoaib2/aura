import type { INodeProperties } from 'workflow';

import * as upload from './upload.operation';

export { upload };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Upload File',
				value: 'upload',
				action: 'Upload a file',
				description: 'Upload a file to the Google Gemini API for later use',
			},
		],
		default: 'upload',
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
	},
	...upload.description,
];
