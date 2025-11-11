<script setup lang="ts">
import { useI18n } from '@aura/i18n';

import { N8nIconButton } from '@aura/design-system';
const i18n = useI18n();
</script>
<template>
	<N8nIconButton
		:title="i18n.baseText('nodeView.deletesTheCurrentExecutionData')"
		icon="trash-2"
		size="large"
		data-test-id="clear-execution-data-button"
	/>
</template>
