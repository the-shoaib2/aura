import type { IDataObject } from 'workflow';

export interface IData {
	data: [
		{
			id: string;
		},
	];
}

export interface IRelation {
	data: [
		{
			relationships: {
				identities: IData;
				member: IData;
			};
		},
	];
	included: IDataObject[];
}
