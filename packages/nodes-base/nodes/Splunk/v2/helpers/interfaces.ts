import type { IDataObject } from 'workflow';

export type SplunkCredentials = {
	authToken: string;
	baseUrl: string;
	allowUnauthorizedCerts: boolean;
};

export type SplunkFeedResponse = {
	feed: {
		entry: IDataObject[] | IDataObject;
	};
};

export type SplunkError = {
	response?: {
		messages?: {
			msg: {
				$: { type: string };
				_: string;
			};
		};
	};
};
