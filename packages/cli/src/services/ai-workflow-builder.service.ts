import { AiWorkflowBuilderService } from '@aura/ai-workflow-builder';
import { ChatPayload } from '@aura/ai-workflow-builder/dist/workflow-builder-agent';
import { Logger } from '@aura/backend-common';
import { GlobalConfig } from '@aura/config';
import { Service } from '@aura/di';
import { AiAssistantClient } from '@aura_io/ai-assistant-sdk';
import type { IUser } from 'workflow';

import { N8N_VERSION } from '@/constants';
import { License } from '@/license';
import { LoadNodesAndCredentials } from '@/load-nodes-and-credentials';
import { Push } from '@/push';
import { UrlService } from '@/services/url.service';

/**
 * This service wraps the actual AiWorkflowBuilderService to avoid circular dependencies.
 * Instead of extending, we're delegating to the real service which is created on-demand.
 */
@Service()
export class WorkflowBuilderService {
	private service: AiWorkflowBuilderService | undefined;

	constructor(
		private readonly loadNodesAndCredentials: LoadNodesAndCredentials,
		private readonly license: License,
		private readonly config: GlobalConfig,
		private readonly logger: Logger,
		private readonly urlService: UrlService,
		private readonly push: Push,
	) {}

	private async getService(): Promise<AiWorkflowBuilderService> {
		if (!this.service) {
			let client: AiAssistantClient | undefined;

			// Create AiAssistantClient if baseUrl is configured
			const baseUrl = this.config.aiAssistant.baseUrl;
			if (baseUrl) {
				const licenseCert = await this.license.loadCertStr();
				const consumerId = this.license.getConsumerId();

				client = new AiAssistantClient({
					licenseCert,
					consumerId,
					baseUrl,
					auraVersion: N8N_VERSION,
				});
			}

			// Create callback that uses the push service
			const onCreditsUpdated = (userId: string, creditsQuota: number, creditsClaimed: number) => {
				this.push.sendToUsers(
					{
						type: 'updateBuilderCredits',
						data: {
							creditsQuota,
							creditsClaimed,
						},
					},
					[userId],
				);
			};

			const { nodes: nodeTypeDescriptions } = this.loadNodesAndCredentials.types;

			this.service = new AiWorkflowBuilderService(
				nodeTypeDescriptions,
				client,
				this.logger,
				this.urlService.getInstanceBaseUrl(),
				onCreditsUpdated,
			);
		}

		return this.service;
	}

	async *chat(payload: ChatPayload, user: IUser, abortSignal?: AbortSignal) {
		const service = await this.getService();
		yield* service.chat(payload, user, abortSignal);
	}

	async getSessions(workflowId: string | undefined, user: IUser) {
		const service = await this.getService();
		const sessions = await service.getSessions(workflowId, user);
		return sessions;
	}

	async getSessionsMetadata(workflowId: string | undefined, user: IUser) {
		const service = await this.getService();
		const sessions = await service.getSessions(workflowId, user);
		const hasMessages = sessions.sessions.length > 0 && sessions.sessions[0].messages.length > 0;
		return { hasMessages };
	}

	async getBuilderInstanceCredits(user: IUser) {
		const service = await this.getService();
		return await service.getBuilderInstanceCredits(user);
	}
}
