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
// This will be expanded as we add more integrations
import { integrationRegistry } from './registry';

// Register integrations from categories
// Categories will export their integrations
// import * as CommunicationIntegrations from './categories/communication';
// import * as CrmIntegrations from './categories/crm';
// ... etc

// Auto-registration will happen here as integrations are added
