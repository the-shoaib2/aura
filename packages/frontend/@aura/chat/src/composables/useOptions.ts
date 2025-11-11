import { inject } from 'vue';

import { ChatOptionsSymbol } from '@aura/chat/constants';
import type { ChatOptions } from '@aura/chat/types';

export function useOptions() {
	const options = inject(ChatOptionsSymbol) as ChatOptions;

	return {
		options,
	};
}
