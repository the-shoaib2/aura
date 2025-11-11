import type { INodeProperties } from 'workflow';
import { companyGetManyDescription } from './getAll';

const showOnlyForCompanies = {
	resource: ['company'],
};

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompanies,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get companies',
				description: 'Get companies',
				routing: {
					request: {
						method: 'GET',
						url: '/companies',
					},
				},
			},
		],
		default: 'getAll',
	},
	...companyGetManyDescription,
];
