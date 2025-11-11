import type { AllEntities } from 'workflow';

type NodeMap = {
	text: 'message';
	image: 'analyze';
	document: 'analyze';
	file: 'upload' | 'deleteFile' | 'get' | 'list';
	prompt: 'generate' | 'improve' | 'templatize';
};

export type AnthropicType = AllEntities<NodeMap>;
