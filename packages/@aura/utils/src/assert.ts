/**
 * Asserts given condition
 */
export function assert(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		// eslint-disable-next-line aura-local-rules/no-plain-errors
		throw new Error(message ?? 'Assertion failed');
	}
}
