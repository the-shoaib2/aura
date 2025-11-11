import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import { configurePostgres } from 'aura-nodes-base/dist/nodes/Postgres/transport/index';
import type { PostgresNodeCredentials } from 'aura-nodes-base/dist/nodes/Postgres/v2/helpers/interfaces';
import { postgresConnectionTest } from 'aura-nodes-base/dist/nodes/Postgres/v2/methods/credentialTest';
import type { ISupplyDataFunctions, INodeType, INodeTypeDescription, SupplyData } from 'workflow';
import { NodeConnectionTypes } from 'workflow';
import type pg from 'pg';

import { getSessionId } from '@utils/helpers';
import { logWrapper } from '@utils/logWrapper';
import { getConnectionHintNoticeField } from '@utils/sharedFields';

import {
	sessionIdOption,
	sessionKeyProperty,
	contextWindowLengthProperty,
	expressionSessionKeyProperty,
} from '../descriptions';

export class MemoryPostgresChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Postgres Chat Memory',
		name: 'memoryPostgresChat',
		icon: 'file:postgres.svg',
		group: ['transform'],
		version: [1, 1.1, 1.2, 1.3],
		description: 'Stores the chat history in Postgres table.',
		defaults: {
			name: 'Postgres Chat Memory',
		},
		credentials: [
			{
				name: 'postgres',
				required: true,
				testedBy: 'postgresConnectionTest',
			},
		],
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Memory'],
				Memory: ['Other memories'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.aura.io/integrations/builtin/cluster-nodes/sub-nodes/aura-nodes-langchain.memorypostgreschat/',
					},
				],
			},
		},

		inputs: [],

		outputs: [NodeConnectionTypes.AiMemory],
		outputNames: ['Memory'],
		properties: [
			getConnectionHintNoticeField([NodeConnectionTypes.AiAgent]),
			sessionIdOption,
			expressionSessionKeyProperty(1.2),
			sessionKeyProperty,
			{
				displayName: 'Table Name',
				name: 'tableName',
				type: 'string',
				default: 'aura_chat_histories',
				description:
					'The table name to store the chat history in. If table does not exist, it will be created.',
			},
			{
				...contextWindowLengthProperty,
				displayOptions: { hide: { '@version': [{ _cnd: { lt: 1.1 } }] } },
			},
		],
	};

	methods = {
		credentialTest: {
			postgresConnectionTest,
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials<PostgresNodeCredentials>('postgres');
		const tableName = this.getNodeParameter(
			'tableName',
			itemIndex,
			'aura_chat_histories',
		) as string;
		const sessionId = getSessionId(this, itemIndex);

		const pgConf = await configurePostgres.call(this, credentials);
		const pool = pgConf.db.$pool as unknown as pg.Pool;

		const pgChatHistory = new PostgresChatMessageHistory({
			pool,
			sessionId,
			tableName,
		});

		const memClass = this.getNode().typeVersion < 1.1 ? BufferMemory : BufferWindowMemory;
		const kOptions =
			this.getNode().typeVersion < 1.1
				? {}
				: { k: this.getNodeParameter('contextWindowLength', itemIndex) };

		const memory = new memClass({
			memoryKey: 'chat_history',
			chatHistory: pgChatHistory,
			returnMessages: true,
			inputKey: 'input',
			outputKey: 'output',
			...kOptions,
		});

		return {
			response: logWrapper(memory, this),
		};
	}
}
