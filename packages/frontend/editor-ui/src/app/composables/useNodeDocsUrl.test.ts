import { NPM_PACKAGE_DOCS_BASE_URL } from '../constants';
import { useNodeDocsUrl } from './useNodeDocsUrl';

import type { INodeTypeDescription } from 'workflow';
import { mock } from 'vitest-mock-extended';

describe('useNodeDocsUrl', () => {
	it('returns full documentationUrl if set', () => {
		const nodeType = mock<INodeTypeDescription>({
			name: 'aura-nodes-base.set',
			documentationUrl: 'https://example.com/docs',
		});
		const { docsUrl } = useNodeDocsUrl({ nodeType });
		expect(docsUrl.value).toBe('https://example.com/docs');
	});

	it('returns codex primaryDocumentation url with UTM params', () => {
		const nodeType = mock<INodeTypeDescription>({
			name: 'aura-nodes-base.set',
			documentationUrl: '',
			codex: {
				resources: {
					primaryDocumentation: [{ url: 'https://docs.aura.io/nodes/MyNode' }],
				},
			},
		});

		const { docsUrl } = useNodeDocsUrl({ nodeType });

		expect(docsUrl.value).toEqual(
			'https://docs.aura.io/nodes/MyNode?utm_source=aura_app&utm_medium=node_settings_modal-credential_link&utm_campaign=aura-nodes-base.set',
		);
	});

	it('returns community docs url for community-nodes', () => {
		const nodeType = mock<INodeTypeDescription>({
			name: 'aura-nodes-custom.custom',
			documentationUrl: '',
		});
		const { docsUrl } = useNodeDocsUrl({ nodeType });

		expect(docsUrl.value).toBe(`${NPM_PACKAGE_DOCS_BASE_URL}aura-nodes-custom`);
	});

	it('returns builtin docs root with UTM if no other match', () => {
		const nodeType = mock<INodeTypeDescription>({
			name: 'aura-nodes-base.set',
			documentationUrl: '',
		});
		const { docsUrl } = useNodeDocsUrl({ nodeType });

		expect(docsUrl.value).toEqual(
			'https://docs.aura.io/integrations/builtin/?utm_source=aura_app&utm_medium=node_settings_modal-credential_link&utm_campaign=aura-nodes-base.set',
		);
	});

	it('returns empty string if documentationUrl is null', () => {
		const nodeType = null;
		const { docsUrl } = useNodeDocsUrl({ nodeType });

		expect(docsUrl.value).toBe('');
	});
});
