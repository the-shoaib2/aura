import type { INode } from 'workflow';
import { NodeOperationError } from 'workflow';

const validOptions = ['notSupported', 'memory', 'manually'] as const;
export type AuthenticationChatOption = 'none' | 'basicAuth' | 'auraUserAuth';
export type LoadPreviousSessionChatOption = (typeof validOptions)[number];

function isValidLoadPreviousSessionOption(value: unknown): value is LoadPreviousSessionChatOption {
	return typeof value === 'string' && (validOptions as readonly string[]).includes(value);
}

export function assertValidLoadPreviousSessionOption(
	value: string | undefined,
	node: INode,
): asserts value is LoadPreviousSessionChatOption | undefined {
	if (value && !isValidLoadPreviousSessionOption(value)) {
		throw new NodeOperationError(node, `Invalid loadPreviousSession option: ${value}`);
	}
}
