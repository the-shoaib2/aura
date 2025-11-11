import { GlobalConfig } from '@aura/config';
import { Container } from '@aura/di';

/**
 * @deprecated Do not add new environment variables to this file. Please use the `@aura/config` package instead.
 */
export const schema = {
	userManagement: {
		/**
		 * @important Do not remove until after cloud hooks are updated to stop using convict config.
		 */
		isInstanceOwnerSetUp: {
			// aura loads this setting from DB on startup
			doc: "Whether the instance owner's account has been set up",
			format: Boolean,
			default: false,
		},

		/**
		 * @techdebt Refactor this to stop using the legacy config schema for internal state.
		 */
		authenticationMethod: {
			doc: 'How to authenticate users (e.g. "email", "ldap", "saml")',
			format: ['email', 'ldap', 'saml'] as const,
			default: 'email',
		},
	},

	/**
	 * @important Do not remove until after cloud hooks are updated to stop using convict config.
	 */
	endpoints: {
		rest: {
			format: String,
			default: Container.get(GlobalConfig).endpoints.rest,
		},
	},

	/**
	 * @important Do not remove until after cloud hooks are updated to stop using convict config.
	 */
	ai: {
		enabled: {
			format: Boolean,
			default: Container.get(GlobalConfig).ai.enabled,
		},
	},
};
