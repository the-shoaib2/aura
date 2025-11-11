import type { IDataObject } from 'workflow';

export interface IAssociation {
	associatedCompanyIds?: number[];
	associatedVids?: number[];
}

export interface IDeal {
	associations?: IAssociation;
	properties?: IDataObject[];
}
