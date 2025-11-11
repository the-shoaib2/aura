import type { AllEntities } from 'workflow';

type NodeMap = {
	itemList:
		| 'concatenateItems'
		| 'limit'
		| 'removeDuplicates'
		| 'sort'
		| 'splitOutItems'
		| 'summarize';
};

export type ItemListsType = AllEntities<NodeMap>;
