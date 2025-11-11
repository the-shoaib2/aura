import { mock } from 'jest-mock-extended';
import type { INodeTypeDescription } from 'workflow';

import type { SimpleWorkflow } from '@/types';

import { evaluateTrigger } from './trigger';

describe('evaluateTrigger', () => {
	const mockNodeTypes: INodeTypeDescription[] = [
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.manualTrigger',
			displayName: 'Manual Trigger',
			group: ['trigger'],
			inputs: [],
			outputs: ['main'],
		}),
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.webhookTrigger',
			displayName: 'Webhook Trigger',
			group: ['trigger'],
			inputs: [],
			outputs: ['main'],
		}),
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.scheduleTrigger',
			displayName: 'Schedule Trigger',
			group: ['trigger'],
			inputs: [],
			outputs: ['main'],
		}),
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.code',
			displayName: 'Code',
			group: ['transform'],
			inputs: ['main'],
			outputs: ['main'],
		}),
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.httpRequest',
			displayName: 'HTTP Request',
			group: ['transform'],
			inputs: ['main'],
			outputs: ['main'],
		}),
		mock<INodeTypeDescription>({
			name: 'aura-nodes-base.set',
			displayName: 'Set',
			group: ['input'],
			inputs: ['main'],
			outputs: ['main'],
		}),
	];

	describe('basic trigger validation', () => {
		it('should detect workflow with no nodes', () => {
			const workflow = mock<SimpleWorkflow>({
				name: 'Empty Workflow',
				nodes: [],
				connections: {},
			});

			const result = evaluateTrigger(workflow, mockNodeTypes);

			expect(result.violations).toContainEqual(
				expect.objectContaining({ description: 'Workflow has no nodes' }),
			);
		});

		it('should detect workflow with no trigger nodes', () => {
			const workflow = mock<SimpleWorkflow>({
				name: 'No Trigger Workflow',
				nodes: [
					{
						id: '1',
						name: 'Code',
						type: 'aura-nodes-base.code',
						parameters: {},
						typeVersion: 1,
						position: [0, 0],
					},
					{
						id: '2',
						name: 'HTTP Request',
						type: 'aura-nodes-base.httpRequest',
						parameters: {},
						typeVersion: 1,
						position: [200, 0],
					},
				],
				connections: {},
			});

			const result = evaluateTrigger(workflow, mockNodeTypes);

			expect(result.violations).toContainEqual(
				expect.objectContaining({
					description: 'Workflow must have at least one trigger node to start execution',
				}),
			);
		});

		it('should accept workflow with one trigger node', () => {
			const workflow = mock<SimpleWorkflow>({
				name: 'Valid Workflow',
				nodes: [
					{
						id: '1',
						name: 'Manual Trigger',
						type: 'aura-nodes-base.manualTrigger',
						parameters: {},
						typeVersion: 1,
						position: [0, 0],
					},
					{
						id: '2',
						name: 'Code',
						type: 'aura-nodes-base.code',
						parameters: {},
						typeVersion: 1,
						position: [200, 0],
					},
				],
				connections: {},
			});

			const result = evaluateTrigger(workflow, mockNodeTypes);

			expect(result.violations).toEqual([]);
		});
	});

	describe('edge cases', () => {
		it('should handle unknown node types gracefully', () => {
			const workflow = mock<SimpleWorkflow>({
				name: 'Unknown Node Workflow',
				nodes: [
					{
						id: '1',
						name: 'Unknown Trigger',
						type: 'aura-nodes-base.unknownTrigger',
						parameters: {},
						typeVersion: 1,
						position: [0, 0],
					},
					{
						id: '2',
						name: 'Manual Trigger',
						type: 'aura-nodes-base.manualTrigger',
						parameters: {},
						typeVersion: 1,
						position: [200, 0],
					},
				],
				connections: {},
			});

			const result = evaluateTrigger(workflow, mockNodeTypes);
			expect(result.violations).toEqual([]);
		});

		it('should handle mixed trigger and non-trigger nodes', () => {
			const workflow = mock<SimpleWorkflow>({
				name: 'Mixed Workflow',
				nodes: [
					{
						id: '1',
						name: 'Set Data',
						type: 'aura-nodes-base.set',
						parameters: {},
						typeVersion: 1,
						position: [0, 0],
					},
					{
						id: '2',
						name: 'Webhook',
						type: 'aura-nodes-base.webhookTrigger',
						parameters: {},
						typeVersion: 1,
						position: [200, 0],
					},
					{
						id: '3',
						name: 'Process',
						type: 'aura-nodes-base.code',
						parameters: {},
						typeVersion: 1,
						position: [400, 0],
					},
					{
						id: '4',
						name: 'Manual',
						type: 'aura-nodes-base.manualTrigger',
						parameters: {},
						typeVersion: 1,
						position: [0, 200],
					},
					{
						id: '5',
						name: 'HTTP Call',
						type: 'aura-nodes-base.httpRequest',
						parameters: {},
						typeVersion: 1,
						position: [600, 0],
					},
				],
				connections: {},
			});

			const result = evaluateTrigger(workflow, mockNodeTypes);
			expect(result.violations).toEqual([]);
		});
	});
});
