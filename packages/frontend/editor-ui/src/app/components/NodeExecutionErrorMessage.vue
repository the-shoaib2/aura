<script lang="ts" setup>
import { useI18n } from '@aura/i18n';

const i18n = useI18n();

defineProps<{
	nodeName: string;
	errorMessage?: string;
}>();
</script>

<template>
	<div>
		<span v-aura-html="errorMessage" data-test-id="sanitized-error-message"></span>
		<br />
		<a data-action="openNodeDetail" :data-action-parameter-node="nodeName">{{
			i18n.baseText('node.executionError.openNode')
		}}</a>
	</div>
</template>
