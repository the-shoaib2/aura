import { BreakingChangeRecommendation } from '@aura/api-types';
import { WorkflowEntity } from '@aura/db';
import { Service } from '@aura/di';
import { INode } from 'workflow';

import type {
	BreakingChangeRuleMetadata,
	IBreakingChangeWorkflowRule,
	WorkflowDetectionReport,
} from '../../types';
import { BreakingChangeCategory } from '../../types';

@Service()
export class FileAccessRule implements IBreakingChangeWorkflowRule {
	private readonly FILE_NODES = [
		'aura-nodes-base.readWriteFile',
		'aura-nodes-base.readBinaryFiles',
	];

	id: string = 'file-access-restriction-v2';

	getMetadata(): BreakingChangeRuleMetadata {
		return {
			version: 'v2',
			title: 'File Access Restrictions',
			description: 'File access is now restricted to a default directory for security purposes',
			category: BreakingChangeCategory.workflow,
			severity: 'high',
		};
	}

	async getRecommendations(): Promise<BreakingChangeRecommendation[]> {
		return [
			{
				action: 'Configure file access paths',
				description:
					'Set N8N_RESTRICT_FILE_ACCESS_TO to a semicolon-separated list of allowed paths if workflows need to access files outside the default directory',
			},
		];
	}

	async detectWorkflow(
		_workflow: WorkflowEntity,
		nodesGroupedByType: Map<string, INode[]>,
	): Promise<WorkflowDetectionReport> {
		const fileNodes = this.FILE_NODES.flatMap((nodeType) => nodesGroupedByType.get(nodeType) ?? []);
		if (fileNodes.length === 0) return { isAffected: false, issues: [] };

		return {
			isAffected: true,
			issues: fileNodes.map((node) => ({
				title: `File access node '${node.type}' with name '${node.name}' affected`,
				description: 'File access for this node is now restricted to configured directories.',
				level: 'warning',
				nodeId: node.id,
				nodeName: node.name,
			})),
		};
	}
}
