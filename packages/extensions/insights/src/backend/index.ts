import { defineBackendExtension } from '@aura/extension-sdk/backend';

export default defineBackendExtension({
	setup(aura) {
		console.log(aura);
	},
});
