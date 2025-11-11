import { E2E_TEST_NODE_NAME } from '../../config/constants';
import { test, expect } from '../../fixtures/base';

const NO_CREDENTIALS_MESSAGE = 'Add your credential';
const INVALID_CREDENTIALS_MESSAGE = 'Check your credential';
const MODE_SELECTOR_LIST = 'From list';

test.describe('Resource Locator', () => {
	test.beforeEach(async ({ aura }) => {
		await aura.start.fromBlankCanvas();
	});

	test('should render both RLC components in google sheets', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Google Sheets', { closeNDV: false, action: 'Update row in sheet' });

		await expect(aura.ndv.getResourceLocator('documentId')).toBeVisible();
		await expect(aura.ndv.getResourceLocator('sheetName')).toBeVisible();
		await expect(aura.ndv.getResourceLocatorModeSelectorInput('documentId')).toHaveValue(
			MODE_SELECTOR_LIST,
		);
		await expect(aura.ndv.getResourceLocatorModeSelectorInput('sheetName')).toHaveValue(
			MODE_SELECTOR_LIST,
		);
	});

	test('should show appropriate error when credentials are not set', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Google Sheets', { closeNDV: false, action: 'Update row in sheet' });

		await expect(aura.ndv.getResourceLocator('documentId')).toBeVisible();

		await aura.ndv.getResourceLocatorInput('documentId').click();

		await expect(aura.ndv.getResourceLocatorErrorMessage('documentId')).toContainText(
			NO_CREDENTIALS_MESSAGE,
		);
	});

	test('should show create credentials modal when clicking "add your credential"', async ({
		aura,
	}) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Google Sheets', { closeNDV: false, action: 'Update row in sheet' });

		await expect(aura.ndv.getResourceLocator('documentId')).toBeVisible();

		await aura.ndv.getResourceLocatorInput('documentId').click();

		await expect(aura.ndv.getResourceLocatorErrorMessage('documentId')).toContainText(
			NO_CREDENTIALS_MESSAGE,
		);

		await aura.ndv.getResourceLocatorAddCredentials('documentId').click();

		await expect(aura.canvas.credentialModal.getModal()).toBeVisible();
	});

	test('should show appropriate error when credentials are not valid', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Google Sheets', { closeNDV: false, action: 'Update row in sheet' });

		// Add oAuth credentials
		await aura.ndv.getNodeCredentialsSelect().click();
		await aura.ndv.credentialDropdownCreateNewCredential().click();

		await expect(aura.canvas.credentialModal.getModal()).toBeVisible();

		await aura.canvas.credentialModal.getAuthTypeRadioButtons().first().click();
		await aura.canvas.credentialModal.fillAllFields({
			clientId: 'dummy-client-id',
			clientSecret: 'dummy-client-secret',
		});
		await aura.canvas.credentialModal.save();
		await aura.canvas.credentialModal.close();
		// Close warning modal about not connecting the OAuth credentials
		const closeButton = aura.page.locator('.el-message-box').locator('button:has-text("Close")');
		await closeButton.click();

		await aura.ndv.getResourceLocatorInput('documentId').click();

		await expect(aura.ndv.getResourceLocatorErrorMessage('documentId')).toContainText(
			INVALID_CREDENTIALS_MESSAGE,
		);
	});

	test('should show appropriate errors when search filter is required', async ({ aura }) => {
		await aura.canvas.addNode('GitHub', { closeNDV: false, trigger: 'On pull request' });

		await expect(aura.ndv.getResourceLocator('owner')).toBeVisible();
		await aura.ndv.getResourceLocatorInput('owner').click();

		await expect(aura.ndv.getResourceLocatorErrorMessage('owner')).toContainText(
			NO_CREDENTIALS_MESSAGE,
		);
	});

	test('should reset resource locator when dependent field is changed', async ({ aura }) => {
		await aura.canvas.addNode('Manual Trigger');
		await aura.canvas.addNode('Google Sheets', { closeNDV: false, action: 'Update row in sheet' });

		await aura.ndv.setRLCValue('documentId', '123');
		await aura.ndv.setRLCValue('sheetName', '123', 1);
		await aura.ndv.setRLCValue('documentId', '321');

		await expect(aura.ndv.getResourceLocatorInput('sheetName').locator('input')).toHaveValue('');
	});

	// unlike RMC and remote options, RLC does not support loadOptionDependsOn
	test('should retrieve list options when other params throw errors', async ({ aura }) => {
		await aura.canvas.addNode(E2E_TEST_NODE_NAME, { closeNDV: false, action: 'Resource Locator' });

		await aura.ndv.getResourceLocatorInput('rlc').click();

		await expect(aura.page.getByTestId('rlc-item').first()).toBeVisible();
		const visiblePopper = aura.ndv.getVisiblePopper();
		await expect(visiblePopper).toHaveCount(1);
		await expect(visiblePopper.getByTestId('rlc-item')).toHaveCount(5);

		await aura.ndv.setInvalidExpression({ fieldName: 'fieldId' });

		await aura.ndv.getInputPanel().click(); // remove focus from input, hide expression preview

		// wait for the expression to be evaluated and show the error
		await expect(aura.ndv.getParameterInputHint()).toContainText('ERROR');

		await aura.ndv.getResourceLocatorInput('rlc').click();

		await expect(aura.page.getByTestId('rlc-item').first()).toBeVisible();
		const visiblePopperAfter = aura.ndv.getVisiblePopper();
		await expect(visiblePopperAfter).toHaveCount(1);
		await expect(visiblePopperAfter.getByTestId('rlc-item')).toHaveCount(5);
	});
});
