import type { IVersionedNodeType, INodeTypeBaseDescription } from 'workflow';
import { VersionedNodeType } from 'workflow';

import { ToolWorkflowV1 } from './v1/ToolWorkflowV1.node';
import { ToolWorkflowV2 } from './v2/ToolWorkflowV2.node';

export class ToolWorkflow extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Call aura Sub-Workflow Tool',
			name: 'toolWorkflow',
			icon: 'fa:network-wired',
			iconColor: 'black',
			group: ['transform'],
			description:
				'Uses another aura workflow as a tool. Allows packaging any aura node(s) as a tool.',
			codex: {
				categories: ['AI'],
				subcategories: {
					AI: ['Tools'],
					Tools: ['Recommended Tools'],
				},
				resources: {
					primaryDocumentation: [
						{
							url: 'https://docs.aura.io/integrations/builtin/cluster-nodes/sub-nodes/aura-nodes-langchain.toolworkflow/',
						},
					],
				},
			},
			defaultVersion: 2.2,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new ToolWorkflowV1(baseDescription),
			1.1: new ToolWorkflowV1(baseDescription),
			1.2: new ToolWorkflowV1(baseDescription),
			1.3: new ToolWorkflowV1(baseDescription),
			2: new ToolWorkflowV2(baseDescription),
			2.1: new ToolWorkflowV2(baseDescription),
			2.2: new ToolWorkflowV2(baseDescription),
		};
		super(nodeVersions, baseDescription);
	}
}
