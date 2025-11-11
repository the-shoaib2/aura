import ChatEmbedModal from '@/app/components/ChatEmbedModal.vue';
import { createTestingPinia } from '@pinia/testing';
import { CHAT_EMBED_MODAL_KEY, WEBHOOK_NODE_TYPE } from '@/app/constants';
import { STORES } from '@aura/stores';
import { createComponentRenderer } from '@/__tests__/render';
import { waitFor } from '@testing-library/vue';

const renderComponent = createComponentRenderer(ChatEmbedModal, {
	pinia: createTestingPinia({
		initialState: {
			[STORES.UI]: {
				modalsById: {
					[CHAT_EMBED_MODAL_KEY]: { open: true },
				},
			},
			[STORES.WORKFLOWS]: {
				workflow: {
					nodes: [{ type: WEBHOOK_NODE_TYPE }],
				},
			},
		},
	}),
});

describe('ChatEmbedModal', () => {
	it('should render correctly', async () => {
		const { getByTestId } = renderComponent();

		await waitFor(() => expect(getByTestId('chatEmbed-modal')).toBeInTheDocument());

		const modalContainer = getByTestId('chatEmbed-modal');
		const tabs = modalContainer.querySelectorAll('.aura-tabs .tab');
		const activeTab = modalContainer.querySelector('.aura-tabs .tab.activeTab');
		const editor = modalContainer.querySelector('.cm-editor');

		expect(tabs).toHaveLength(4);
		expect(activeTab).toBeVisible();
		expect(activeTab).toHaveTextContent('CDN Embed');
		expect(editor).toBeVisible();
	});
});
