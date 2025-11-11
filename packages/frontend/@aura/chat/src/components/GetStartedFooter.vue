<script setup lang="ts">
import PoweredBy from '@aura/chat/components/PoweredBy.vue';
import { useI18n } from '@aura/chat/composables';

const { t, te } = useI18n();
</script>
<template>
	<div class="chat-get-started-footer">
		<div v-if="te('footer')">
			{{ t('footer') }}
		</div>
		<PoweredBy />
	</div>
</template>

<style lang="scss">
.chat-get-started-footer {
	padding: var(--chat--spacing);
}
</style>
