import { MANUAL_TRIGGER_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import customCredential from '../../workflows/Custom_credential.json';
import customNodeFixture from '../../workflows/Custom_node.json';
import customNodeWithCustomCredentialFixture from '../../workflows/Custom_node_custom_credential.json';
import customNodeWithN8nCredentialFixture from '../../workflows/Custom_node_aura_credential.json';

const CUSTOM_NODE_NAME = 'E2E Node';
const CUSTOM_NODE_WITH_N8N_CREDENTIAL = 'E2E Node with native aura credential';
const CUSTOM_NODE_WITH_CUSTOM_CREDENTIAL = 'E2E Node with custom credential';
const MOCK_PACKAGE = {
	createdAt: '2024-07-22T19:08:06.505Z',
	updatedAt: '2024-07-22T19:08:06.505Z',
	packageName: 'aura-nodes-chatwork',
	installedVersion: '1.0.0',
	authorName: null,
	authorEmail: null,
	installedNodes: [
		{
			name: 'Chatwork',
			type: 'aura-nodes-chatwork.chatwork',
			latestVersion: 1,
		},
	],
	updateAvailable: '1.1.2',
};

test.describe('Community and custom nodes in canvas', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.page.route('/types/nodes.json', async (route) => {
			const response = await route.fetch();
			const nodes = await response.json();
			nodes.push(
				customNodeFixture,
				customNodeWithN8nCredentialFixture,
				customNodeWithCustomCredentialFixture,
			);
			await route.fulfill({
				response,
				json: nodes,
				headers: { 'cache-control': 'no-cache, no-store' },
			});
		});

		await aura.page.route('/types/credentials.json', async (route) => {
			const response = await route.fetch();
			const credentials = await response.json();
			credentials.push(customCredential);
			await route.fulfill({
				response,
				json: credentials,
				headers: { 'cache-control': 'no-cache, no-store' },
			});
		});

		await aura.page.route('/community-node-types', async (route) => {
			await route.fulfill({ status: 200, json: { data: [] } });
		});

		await aura.page.route('**/community-node-types/*', async (route) => {
			await route.fulfill({ status: 200, json: null });
		});

		await aura.page.route('https://registry.npmjs.org/*', async (route) => {
			await route.fulfill({ status: 404, json: {} });
		});
	});

	test('should render and select community node', async ({ aura }) => {
		await aura.start.fromBlankCanvas();

		await aura.canvas.clickCanvasPlusButton();
		await aura.canvas.fillNodeCreatorSearchBar(CUSTOM_NODE_NAME);
		await aura.canvas.clickNodeCreatorItemName(CUSTOM_NODE_NAME);
		await aura.canvas.clickAddToWorkflowButton();

		await expect(aura.ndv.getNodeParameters()).toBeVisible();

		await expect(aura.ndv.getParameterInputField('testProp')).toHaveValue('Some default');
		await expect(aura.ndv.getParameterInputField('resource')).toHaveValue('option2');

		await aura.ndv.selectOptionInParameterDropdown('resource', 'option4');
		await expect(aura.ndv.getParameterInputField('resource')).toHaveValue('option4');
	});

	test('should render custom node with aura credential', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

		await aura.canvas.clickNodeCreatorPlusButton();
		await aura.canvas.fillNodeCreatorSearchBar(CUSTOM_NODE_WITH_N8N_CREDENTIAL);
		await aura.canvas.clickNodeCreatorItemName(CUSTOM_NODE_WITH_N8N_CREDENTIAL);
		await aura.canvas.clickAddToWorkflowButton();

		await aura.page.getByTestId('credentials-label').click();
		await aura.page.getByTestId('node-credentials-select-item-new').click();

		await expect(aura.page.getByTestId('editCredential-modal')).toContainText('Notion API');
	});

	test('should render custom node with custom credential', async ({ aura }) => {
		await aura.start.fromBlankCanvas();
		await aura.canvas.addNode(MANUAL_TRIGGER_NODE_NAME);

		await aura.canvas.clickNodeCreatorPlusButton();
		await aura.canvas.fillNodeCreatorSearchBar(CUSTOM_NODE_WITH_CUSTOM_CREDENTIAL);
		await aura.canvas.clickNodeCreatorItemName(CUSTOM_NODE_WITH_CUSTOM_CREDENTIAL);
		await aura.canvas.clickAddToWorkflowButton();

		await aura.page.getByTestId('credentials-label').click();
		await aura.page.getByTestId('node-credentials-select-item-new').click();

		await expect(aura.page.getByTestId('editCredential-modal')).toContainText(
			'Custom E2E Credential',
		);
	});
});

test.describe('Community nodes management', () => {
	test('can install, update and uninstall community nodes', async ({ aura }) => {
		await aura.page.route('**/api.npms.io/v2/search*', async (route) => {
			await route.fulfill({ status: 200, json: {} });
		});

		await aura.page.route('/rest/community-packages', async (route) => {
			if (route.request().method() === 'GET') {
				await route.fulfill({ status: 200, json: { data: [] } });
			}
		});

		await aura.navigate.toCommunityNodes();

		await aura.page.route('/rest/community-packages', async (route) => {
			if (route.request().method() === 'POST') {
				await route.fulfill({ status: 200, json: { data: MOCK_PACKAGE } });
			} else if (route.request().method() === 'GET') {
				await route.fulfill({ status: 200, json: { data: [MOCK_PACKAGE] } });
			}
		});

		await aura.communityNodes.installPackage('aura-nodes-chatwork@1.0.0');
		await expect(aura.communityNodes.getCommunityCards()).toHaveCount(1);
		await expect(aura.communityNodes.getCommunityCards().first()).toContainText('v1.0.0');

		const updatedPackage = {
			...MOCK_PACKAGE,
			installedVersion: '1.2.0',
			updateAvailable: undefined,
		};
		await aura.page.route('/rest/community-packages', async (route) => {
			if (route.request().method() === 'PATCH') {
				await route.fulfill({ status: 200, json: { data: updatedPackage } });
			}
		});

		await aura.communityNodes.updatePackage();
		await expect(aura.communityNodes.getCommunityCards()).toHaveCount(1);
		await expect(aura.communityNodes.getCommunityCards().first()).not.toContainText('v1.0.0');

		await aura.page.route('/rest/community-packages*', async (route) => {
			if (route.request().method() === 'DELETE') {
				await route.fulfill({ status: 204 });
			}
		});

		await aura.communityNodes.uninstallPackage();
		await expect(aura.communityNodes.getActionBox()).toBeVisible();
	});
});
