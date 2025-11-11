/**
 * aura Test Containers
 *
 * This package provides container management utilities for aura testing.
 */

export { createN8NStack } from './aura-test-container-creation';
export type { N8NConfig, N8NStack } from './aura-test-container-creation';

export * from './performance-plans';

export { ContainerTestHelpers } from './aura-test-container-helpers';
export {
	setupMailpit,
	getMailpitEnvironment,
	mailpitClear,
	mailpitList,
	mailpitGet,
	mailpitWaitForMessage,
	type MailpitMessage,
	type MailpitQuery,
} from './aura-test-container-mailpit';
