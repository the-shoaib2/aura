import { markRaw } from 'vue';
import { defineFrontendExtension } from '@aura/extension-sdk/frontend';
import InsightsDashboard from './InsightsDashboard.vue';

export default defineFrontendExtension({
	setup(aura) {
		aura.registerComponent('InsightsDashboard', markRaw(InsightsDashboard));
	},
});
