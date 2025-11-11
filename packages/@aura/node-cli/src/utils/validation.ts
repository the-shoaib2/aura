export const validateNodeName = (name: string): string | undefined => {
	if (!name) return;

	// 1. Matches '@org/aura-nodes-anything'
	const regexScoped = /^@([a-z0-9]+(?:-[a-z0-9]+)*)\/aura-nodes-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
	// 2. Matches 'aura-nodes-anything'
	const regexUnscoped = /^aura-nodes-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

	if (!regexScoped.test(name) && !regexUnscoped.test(name)) {
		return "Must start with 'aura-nodes-' or '@org/aura-nodes-'. Examples: aura-nodes-my-app, @mycompany/aura-nodes-my-app";
	}
	return;
};

export function isNodeErrnoException(error: unknown): error is NodeJS.ErrnoException {
	return error instanceof Error && 'code' in error;
}

export function isEnoentError(error: unknown): boolean {
	return isNodeErrnoException(error) && error.code === 'ENOENT';
}
