/**
 * AURA Plugins Package
 *
 * Main entry point for the plugins system supporting 1.5k+ integrations
 */

// Export types
export * from './integration.types';
export * from './base-integration';
export * from './registry';
export * from './categories';

// Export plugin manifest system
export * from './manifest';
export * from './plugin-manifest.types';

// Export registry instance
export { integrationRegistry } from './registry';

// Export existing plugins (legacy compatibility)
export * from './plugin';
export * from './slack';
export * from './github';
export * from './google-workspace';
export * from './email';
export * from './internal-api';
export * from './teams';

// Auto-register all integrations
import { integrationRegistry } from './registry';

// Register system plugins
import {
	SystemFilePlugin,
	SystemClipboardPlugin,
	SystemSchedulerPlugin,
	SystemShellPlugin,
	SystemMousePlugin,
	SystemKeyboardPlugin,
	SystemWindowPlugin,
	SystemAppPlugin,
	SystemAudioPlugin,
	SystemNetworkPlugin,
	SystemVoicePlugin,
	SystemScreenPlugin,
	SystemPowerPlugin,
	SystemNotificationsPlugin,
	SystemHardwarePlugin,
	SystemSecurityPlugin,
	SystemProcessPlugin,
	SystemUpdatePlugin,
} from './categories/system';

// Register system plugins
integrationRegistry.register(new SystemFilePlugin());
integrationRegistry.register(new SystemClipboardPlugin());
integrationRegistry.register(new SystemSchedulerPlugin());
integrationRegistry.register(new SystemShellPlugin());
integrationRegistry.register(new SystemMousePlugin());
integrationRegistry.register(new SystemKeyboardPlugin());
integrationRegistry.register(new SystemWindowPlugin());
integrationRegistry.register(new SystemAppPlugin());
integrationRegistry.register(new SystemAudioPlugin());
integrationRegistry.register(new SystemNetworkPlugin());
integrationRegistry.register(new SystemVoicePlugin());
integrationRegistry.register(new SystemScreenPlugin());
integrationRegistry.register(new SystemPowerPlugin());
integrationRegistry.register(new SystemNotificationsPlugin());
integrationRegistry.register(new SystemHardwarePlugin());
integrationRegistry.register(new SystemSecurityPlugin());
integrationRegistry.register(new SystemProcessPlugin());
integrationRegistry.register(new SystemUpdatePlugin());

// Register network plugins
import { NetworkHttpPlugin, NetworkSocketPlugin, NetworkWebhookPlugin } from './categories/network';

integrationRegistry.register(new NetworkHttpPlugin());
integrationRegistry.register(new NetworkSocketPlugin());
integrationRegistry.register(new NetworkWebhookPlugin());

// Register AI plugins
import { AiCorePlugin, AiAgentPlugin } from './categories/ai';

integrationRegistry.register(new AiCorePlugin());
integrationRegistry.register(new AiAgentPlugin());

// Register core plugins
import { CoreWorkflowPlugin } from './categories/core';

integrationRegistry.register(new CoreWorkflowPlugin());

// Register integration plugins
import {
	IntegrationGithubPlugin,
	IntegrationSlackPlugin,
	IntegrationOpenaiPlugin,
} from './categories/integration';

integrationRegistry.register(new IntegrationGithubPlugin());
integrationRegistry.register(new IntegrationSlackPlugin());
integrationRegistry.register(new IntegrationOpenaiPlugin());

// Register integrations from other categories
// import * as CommunicationIntegrations from './categories/communication';
// import * as CrmIntegrations from './categories/crm';
// ... etc
