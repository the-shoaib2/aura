/**
 * @core/workflow Plugin
 *
 * Visual workflow builder
 */

import { BaseIntegration } from '../../base-integration';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';

const metadata: IntegrationMetadata = {
	name: '@core/workflow',
	version: '1.0.0',
	category: 'core',
	description: 'Visual workflow builder',
	tags: ['workflow', 'core', 'automation'],
};

export class CoreWorkflowPlugin extends BaseIntegration {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'create',
			displayName: 'Create Workflow',
			description: 'Create a new workflow',
			operation: 'create',
			properties: [
				{ name: 'name', displayName: 'Workflow Name', type: 'string', required: true },
				{
					name: 'nodes',
					displayName: 'Nodes',
					type: 'json',
					required: true,
					description: 'Workflow nodes',
				},
				{
					name: 'edges',
					displayName: 'Edges',
					type: 'json',
					required: true,
					description: 'Workflow edges',
				},
			],
		},
		{
			name: 'execute',
			displayName: 'Execute Workflow',
			description: 'Execute a workflow',
			operation: 'execute',
			properties: [
				{ name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: true },
				{
					name: 'input',
					displayName: 'Input Data',
					type: 'json',
					description: 'Workflow input data',
				},
			],
		},
		{
			name: 'save',
			displayName: 'Save Workflow',
			description: 'Save workflow changes',
			operation: 'save',
			properties: [
				{ name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: true },
				{ name: 'workflow', displayName: 'Workflow', type: 'json', required: true },
			],
		},
	];

	protected async executeAction(params: ExecuteParams): Promise<any> {
		// This would integrate with AURA workflow engine
		throw new Error(
			'Workflow plugin requires AURA workflow engine integration. Not yet implemented.',
		);
	}
}
