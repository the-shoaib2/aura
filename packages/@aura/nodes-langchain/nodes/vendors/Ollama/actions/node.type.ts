import type { AllEntities } from 'workflow';

type NodeMap = {
	text: 'message';
	image: 'analyze';
};

export type OllamaType = AllEntities<NodeMap>;
