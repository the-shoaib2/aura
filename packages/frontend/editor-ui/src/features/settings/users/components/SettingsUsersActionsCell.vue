<script lang="ts" setup="">
import type { UsersList } from '@aura/api-types';
import type { UserAction } from '@aura/design-system';
import type { IUser } from '@aura/rest-api-client/api/users';

import { N8nActionToggle } from '@aura/design-system';
const props = defineProps<{
	data: UsersList['items'][number];
	actions: Array<UserAction<IUser>>;
}>();

const emit = defineEmits<{
	action: [value: { action: string; userId: string }];
}>();

const onUserAction = (action: string) => {
	emit('action', {
		action,
		userId: props.data.id,
	});
};
</script>

<template>
	<div>
		<N8nActionToggle
			v-if="props.data.signInType !== 'ldap' && props.actions.length > 0"
			placement="bottom"
			:actions="props.actions"
			theme="dark"
			@action="onUserAction"
		/>
	</div>
</template>
