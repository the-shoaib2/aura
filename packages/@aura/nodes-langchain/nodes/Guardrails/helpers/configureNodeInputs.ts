export const configureNodeInputs = (operation: 'classify' | 'sanitize') => {
	if (operation === 'sanitize') {
		// sanitize operations don't use a chat model
		return ['main'];
	}

	return [
		'main',
		{
			type: 'ai_languageModel',
			displayName: 'Chat Model',
			maxConnections: 1,
			required: true,
			filter: {
				excludedNodes: [
					'@aura/aura-nodes-langchain.lmCohere',
					'@aura/aura-nodes-langchain.lmOllama',
					'aura/aura-nodes-langchain.lmOpenAi',
					'@aura/aura-nodes-langchain.lmOpenHuggingFaceInference',
				],
			},
		},
	];
};
