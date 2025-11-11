import { inject } from 'vue';

import { ChatSymbol } from '@aura/chat/constants';
import type { Chat } from '@aura/chat/types';

export function useChat() {
	return inject(ChatSymbol) as Chat;
}
