import type { AllEntities } from 'workflow';

type NodeMap = {
	channel: 'get' | 'getAll' | 'create' | 'update' | 'deleteChannel';
	message: 'deleteMessage' | 'getAll' | 'get' | 'react' | 'send' | 'sendAndWait';
	member: 'getAll' | 'roleAdd' | 'roleRemove';
	webhook: 'sendLegacy';
};

export type Discord = AllEntities<NodeMap>;
