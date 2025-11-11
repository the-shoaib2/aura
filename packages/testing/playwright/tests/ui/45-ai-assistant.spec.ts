import {
	simpleAssistantResponse,
	codeDiffSuggestionResponse,
	applyCodeDiffResponse,
	nodeExecutionSucceededResponse,
	aiDisabledRequirements,
	aiEnabledRequirements,
	aiEnabledWorkflowBaseRequirements,
	aiEnabledWithWorkflowRequirements,
	aiEnabledWithQuickRepliesRequirements,
	aiEnabledWithEndSessionRequirements,
	aiEnabledWithCodeDiffRequirements,
	aiEnabledWithSimpleChatRequirements,
	aiEnabledWithCodeSnippetRequirements,
	aiEnabledWithHttpWorkflowRequirements,
} from '../../config/ai-assistant-fixtures';
import {
	GMAIL_NODE_NAME,
	HTTP_REQUEST_NODE_NAME,
	MANUAL_TRIGGER_NODE_NAME,
	SCHEDULE_TRIGGER_NODE_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';

type ChatRequestBody = {
	payload?: {
		type?: string;
		text?: string;
		question?: string;
		context?: Record<string, unknown>;
	};
};

test.describe('AI Assistant::disabled', () => {
	test('does not show assistant button if feature is disabled', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(aiDisabledRequirements);
		await aura.page.goto('/workflow/new');
		await expect(aura.canvas.canvasPane()).toBeVisible();
		await expect(aura.aiAssistant.getAskAssistantFloatingButton()).toHaveCount(0);
	});
});

test.describe('AI Assistant::enabled', () => {
	test('renders placeholder UI', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledRequirements);
		await aura.page.goto('/workflow/new');

		await expect(aura.aiAssistant.getAskAssistantCanvasActionButton()).toBeVisible();

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();

		await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();

		await expect(aura.aiAssistant.getPlaceholderMessage()).toBeVisible();

		await expect(aura.aiAssistant.getChatInput()).toBeVisible();

		await expect(aura.aiAssistant.getSendMessageButton()).toBeDisabled();

		await expect(aura.aiAssistant.getCloseChatButton()).toBeVisible();

		await aura.aiAssistant.getCloseChatButton().click();

		await expect(aura.aiAssistant.getAskAssistantChat()).toBeHidden();
	});

	test('should show resizer when chat is open', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledRequirements);
		await aura.page.goto('/workflow/new');

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();

		await expect(aura.aiAssistant.getAskAssistantSidebarResizer()).toBeVisible();

		await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();

		await aura.aiAssistant.getAskAssistantSidebarResizer().hover();

		await aura.aiAssistant.getCloseChatButton().click();
	});

	test('should start chat session from node error view', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledWithWorkflowRequirements);

		await aura.canvas.openNode('Stop and Error');

		await aura.ndv.execute();

		await expect(aura.aiAssistant.getNodeErrorViewAssistantButton()).toBeVisible();
		await expect(aura.aiAssistant.getNodeErrorViewAssistantButton()).toBeEnabled();

		await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

		await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesAll().first()).toContainText(
			'Hey, this is an assistant message',
		);
	});

	test('should render chat input correctly', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledWithWorkflowRequirements);

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();

		await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();
		await expect(aura.aiAssistant.getChatInput()).toBeVisible();

		await expect(aura.aiAssistant.getSendMessageButton()).toBeDisabled();

		await aura.aiAssistant.getChatInput().fill('Test message');

		await expect(aura.aiAssistant.getChatInput()).toHaveValue('Test message');

		await expect(aura.aiAssistant.getSendMessageButton()).toBeEnabled();

		await aura.aiAssistant.getSendMessageButton().click();

		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatInput()).toHaveValue('');
	});

	test('should render and handle quick replies', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledWithQuickRepliesRequirements);

		await aura.canvas.openNode('Stop and Error');

		await aura.ndv.execute();

		await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

		await expect(aura.aiAssistant.getQuickReplyButtons()).toHaveCount(2);

		await expect(aura.aiAssistant.getQuickReplyButtons()).toHaveCount(2);

		await aura.aiAssistant.getQuickReplyButtons().first().click();

		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesUser().first()).toContainText("Sure, let's do it");
	});

	test('should warn before starting a new session', async ({ aura, setupRequirements }) => {
		await setupRequirements(aiEnabledWithWorkflowRequirements);

		await aura.canvas.openNode('Edit Fields');

		await aura.ndv.execute();

		await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

		await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(1);

		await aura.aiAssistant.getCloseChatButton().click();

		await aura.ndv.clickBackToCanvasButton();

		await aura.canvas.openNode('Stop and Error');

		await aura.ndv.execute();

		await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

		await expect(aura.aiAssistant.getNewAssistantSessionModal()).toBeVisible();

		await aura.aiAssistant
			.getNewAssistantSessionModal()
			.getByRole('button', { name: 'Start new session' })
			.click();

		await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(1);
	});

	test('should end chat session when `end_session` event is received', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(aiEnabledWithEndSessionRequirements);

		await aura.canvas.openNode('Stop and Error');

		await aura.ndv.execute();

		await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

		await expect(aura.aiAssistant.getChatMessagesSystem()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesSystem()).toHaveCount(1);

		await expect(aura.aiAssistant.getChatMessagesSystem().first()).toContainText(
			'session has ended',
		);
	});

	test('should reset session after it ended and sidebar is closed', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(aiEnabledRequirements);
		await aura.page.goto('/workflow/new');

		await aura.page.route('**/rest/ai/chat', async (route) => {
			const requestBody = route.request().postDataJSON() as ChatRequestBody;
			const isInit = requestBody.payload?.type === 'init-support-chat';
			const response = isInit
				? simpleAssistantResponse
				: {
						sessionId: '1',
						messages: [
							{
								role: 'assistant',
								type: 'message',
								title: 'Glad to Help',
								text: "I'm glad I could help. If you have any more questions or need further assistance with your aura workflows, feel free to ask!",
							},
							{
								role: 'assistant',
								type: 'event',
								eventName: 'end-session',
							},
						],
					};
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(response),
			});
		});

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
		await aura.aiAssistant.sendMessage('Hello', 'enter-key');

		await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(2);

		await aura.aiAssistant.getCloseChatButton().click();
		// Wait for sidebar to close
		await expect(aura.aiAssistant.getAskAssistantChat()).toBeHidden();
		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
		await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(2);

		await aura.aiAssistant.sendMessage('Thanks, bye', 'enter-key');

		await expect(aura.aiAssistant.getChatMessagesSystem()).toHaveCount(1);
		await expect(aura.aiAssistant.getChatMessagesSystem().first()).toContainText(
			'session has ended',
		);

		await aura.aiAssistant.getCloseChatButton().click();
		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
		await expect(aura.aiAssistant.getPlaceholderMessage()).toBeVisible();
	});

	test('should not reset assistant session when workflow is saved', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(aiEnabledWithSimpleChatRequirements);
		await aura.page.goto('/workflow/new');

		await aura.canvas.addInitialNodeToCanvas(SCHEDULE_TRIGGER_NODE_NAME);
		await aura.ndv.clickBackToCanvasButton();

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
		await aura.aiAssistant.sendMessage('Hello', 'enter-key');

		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);

		await aura.canvas.openNode(SCHEDULE_TRIGGER_NODE_NAME);
		await aura.ndv.execute();

		await expect(aura.aiAssistant.getPlaceholderMessage()).toHaveCount(0);
	});

	test('should send message via shift + enter even with global NodeCreator panel opened', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(aiEnabledWithSimpleChatRequirements);
		await aura.page.goto('/workflow/new');

		await aura.canvas.addInitialNodeToCanvas(SCHEDULE_TRIGGER_NODE_NAME);
		await aura.ndv.clickBackToCanvasButton();

		await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
		await aura.canvas.nodeCreator.open();

		await aura.aiAssistant.sendMessage('Hello', 'enter-key');

		await expect(aura.aiAssistant.getPlaceholderMessage()).toHaveCount(0);
		await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);
	});

	test.describe('Support Chat', () => {
		test('assistant returns code snippet', async ({ aura, setupRequirements }) => {
			await setupRequirements(aiEnabledWithCodeSnippetRequirements);
			await aura.page.goto('/workflow/new');

			await expect(aura.aiAssistant.getAskAssistantCanvasActionButton()).toBeVisible();
			await aura.aiAssistant.getAskAssistantCanvasActionButton().click();

			await expect(aura.aiAssistant.getAskAssistantChat()).toBeVisible();

			await aura.aiAssistant.sendMessage('Show me an expression');

			await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(3);
			await expect(aura.aiAssistant.getChatMessagesUser().first()).toContainText(
				'Show me an expression',
			);
			await expect(aura.aiAssistant.getChatMessagesAssistant().first()).toContainText(
				'To use expressions in aura, follow these steps:',
			);
			await expect(aura.aiAssistant.getChatMessagesAssistant().first()).toContainText('New York');
			await expect(aura.aiAssistant.getCodeSnippet()).toHaveText('{{$json.body.city}}');
		});

		test('should send current context to support chat', async ({ aura, setupRequirements }) => {
			await setupRequirements(aiEnabledWithHttpWorkflowRequirements);

			const chatRequests: ChatRequestBody[] = [];
			await aura.page.route('**/rest/ai/chat', async (route) => {
				const body = route.request().postDataJSON() as ChatRequestBody;
				chatRequests.push(body);
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(simpleAssistantResponse),
				});
			});

			await aura.aiAssistant.getAskAssistantCanvasActionButton().click();
			await aura.aiAssistant.sendMessage('What is wrong with this workflow?');

			const supportRequest = chatRequests.find(
				(request) => request.payload?.question === 'What is wrong with this workflow?',
			);
			expect(supportRequest).toBeDefined();
			const supportContext = supportRequest?.payload?.context;
			expect(supportContext).toBeDefined();
			expect(supportContext?.currentView).toBeDefined();
			expect(supportContext?.currentWorkflow).toBeDefined();
		});

		test('should not send workflow context if nothing changed', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledWithHttpWorkflowRequirements);

			const chatRequests: ChatRequestBody[] = [];
			await aura.page.route('**/rest/ai/chat', async (route) => {
				const body = route.request().postDataJSON() as ChatRequestBody;
				chatRequests.push(body);
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(simpleAssistantResponse),
				});
			});

			await aura.aiAssistant.getAskAssistantCanvasActionButton().click();

			await aura.aiAssistant.sendMessage('What is wrong with this workflow?', 'enter-key');
			// Wait for message to be processed
			await expect(aura.aiAssistant.getChatMessagesAssistant()).toHaveCount(1);

			await aura.aiAssistant.sendMessage('And now?', 'enter-key');
			await expect(aura.aiAssistant.getChatMessagesAssistant()).toHaveCount(2);
			const secondRequest = chatRequests.find((request) => request.payload?.text === 'And now?');
			const secondContext = secondRequest?.payload?.context;
			expect(secondContext?.currentWorkflow).toBeUndefined();

			await aura.canvas.openNode(HTTP_REQUEST_NODE_NAME);
			await aura.ndv.setParameterInputValue('url', 'https://example.com');
			await aura.ndv.close();
			await aura.canvas.clickExecuteWorkflowButton();

			await aura.aiAssistant.sendMessage('What about now?', 'enter-key');
			await expect(aura.aiAssistant.getChatMessagesAssistant()).toHaveCount(3);

			const thirdRequest = chatRequests.find(
				(request) => request.payload?.text === 'What about now?',
			);
			const thirdContext = thirdRequest?.payload?.context;
			expect(thirdContext?.currentWorkflow).toBeTruthy();
			expect(thirdContext?.executionData).toBeTruthy();
		});
	});

	test.describe('Code Node Error Help', () => {
		test('should apply code diff to code node', async ({ aura, setupRequirements }) => {
			await setupRequirements(aiEnabledWithCodeDiffRequirements);

			let applySuggestionCalls = 0;
			await aura.page.route('**/rest/ai/chat/apply-suggestion', async (route) => {
				applySuggestionCalls += 1;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(applyCodeDiffResponse),
				});
			});

			await aura.canvas.openNode('Code');

			await aura.ndv.execute();

			await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

			await expect(aura.aiAssistant.getChatMessagesAll()).toHaveCount(2);
			await expect(aura.aiAssistant.getCodeDiffs()).toHaveCount(1);
			await expect(aura.aiAssistant.getApplyCodeDiffButtons()).toHaveCount(1);

			await aura.aiAssistant.getApplyCodeDiffButtons().first().click();

			await expect(aura.aiAssistant.getApplyCodeDiffButtons()).toHaveCount(0);
			await expect(aura.aiAssistant.getUndoReplaceCodeButtons()).toHaveCount(1);
			await expect(aura.aiAssistant.getCodeReplacedMessage()).toBeVisible();
			await expect(aura.ndv.getCodeEditor()).toContainText('item.json.myNewField = 1');

			await aura.aiAssistant.getUndoReplaceCodeButtons().first().click();

			await expect(aura.aiAssistant.getApplyCodeDiffButtons()).toHaveCount(1);
			await expect(aura.aiAssistant.getCodeReplacedMessage()).toHaveCount(0);
			expect(applySuggestionCalls).toBe(1);
			await expect(aura.ndv.getCodeEditor()).toContainText('item.json.myNewField = 1aaa');

			await aura.aiAssistant.getApplyCodeDiffButtons().first().click();

			await expect(aura.ndv.getCodeEditor()).toContainText('item.json.myNewField = 1');
		});

		test('should ignore node execution success and error messages after the node run successfully once', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledWorkflowBaseRequirements);

			let chatRequestCount = 0;
			await aura.page.route('**/rest/ai/chat', async (route) => {
				chatRequestCount += 1;
				const response =
					chatRequestCount === 1 ? codeDiffSuggestionResponse : nodeExecutionSucceededResponse;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(response),
				});
			});

			await aura.canvas.openNode('Code');
			await aura.ndv.execute();
			await aura.aiAssistant.getNodeErrorViewAssistantButton().click();

			await aura.ndv
				.getCodeEditor()
				.fill(
					"// Loop over input items and add a new field called 'myNewField' to the JSON of each one\nfor (const item of $input.all()) {\n  item.json.myNewField = 1;\n}\n\nreturn $input.all();",
				);

			await aura.ndv.execute();

			await aura.ndv
				.getCodeEditor()
				.fill(
					"// Loop over input items and add a new field called 'myNewField' to the JSON of each one\nfor (const item of $input.all()) {\n  item.json.myNewField = 1aaaa!;\n}\n\nreturn $input.all();",
				);

			await aura.ndv.execute();

			await expect(aura.aiAssistant.getChatMessagesAssistant().nth(2)).toContainText(
				'Code node ran successfully, did my solution help resolve your issue?',
			);
		});
	});

	test.describe('Credential Help', () => {
		test('should start credential help from node credential', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledWithSimpleChatRequirements);
			await aura.page.goto('/workflow/new');

			await aura.canvas.addInitialNodeToCanvas(SCHEDULE_TRIGGER_NODE_NAME);
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.addNode(GMAIL_NODE_NAME, { action: 'Get many messages', closeNDV: false });

			await aura.ndv.clickCreateNewCredential();

			await expect(aura.canvas.credentialModal.getModal()).toBeVisible();

			const assistantButton = aura.aiAssistant.getCredentialEditAssistantButton().locator('button');
			await expect(assistantButton).toBeVisible();
			await assistantButton.click();

			await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);
			await expect(aura.aiAssistant.getChatMessagesUser().first()).toContainText(
				'How do I set up the credentials for Gmail OAuth2 API?',
			);
			await expect(aura.aiAssistant.getChatMessagesAssistant().first()).toContainText(
				'Hey, this is an assistant message',
			);
			await expect(assistantButton).toBeDisabled();
		});

		test('should start credential help from credential list', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledWithSimpleChatRequirements);

			await aura.navigate.toCredentials();

			await aura.workflows.addResource.credential();
			await aura.credentials.selectCredentialType('Notion API');

			const assistantButton = aura.aiAssistant.getCredentialEditAssistantButton().locator('button');
			await expect(assistantButton).toBeVisible();
			await assistantButton.click();

			await expect(aura.aiAssistant.getChatMessagesUser()).toHaveCount(1);
			await expect(aura.aiAssistant.getChatMessagesUser().first()).toContainText(
				'How do I set up the credentials for Notion API?',
			);
			await expect(aura.aiAssistant.getChatMessagesAssistant().first()).toContainText(
				'Hey, this is an assistant message',
			);
			await expect(assistantButton).toBeDisabled();
		});

		test('should not show assistant button if click to connect', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledRequirements);

			await aura.page.route('**/types/credentials.json', async (route) => {
				const response = await route.fetch();
				const credentials = (await response.json()) as Array<
					{ name?: string } & Record<string, unknown>
				>;
				const index = credentials.findIndex((c) => c.name === 'slackOAuth2Api');
				if (index >= 0) {
					credentials[index] = {
						...credentials[index],
						__overwrittenProperties: ['clientId', 'clientSecret'],
					};
				}
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(credentials),
				});
			});

			await aura.page.goto('/workflow/new');
			await aura.canvas.addInitialNodeToCanvas(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode('Slack', { action: 'Get a channel' });

			await aura.ndv.clickCreateNewCredential();

			const authOptions = aura.canvas.credentialModal.getAuthTypeRadioButtons();
			await authOptions.first().click();

			await expect(aura.canvas.credentialModal.oauthConnectButton).toHaveCount(1);
			await expect(aura.canvas.credentialModal.getCredentialInputs()).toHaveCount(2);
			await expect(aura.aiAssistant.getCredentialEditAssistantButton()).toHaveCount(0);

			await authOptions.nth(1).click();
			await expect(aura.canvas.credentialModal.getCredentialInputs()).toHaveCount(4);
			await expect(aura.aiAssistant.getCredentialEditAssistantButton()).toHaveCount(1);
		});

		test('should not show assistant button when click to connect with some fields', async ({
			aura,
			setupRequirements,
		}) => {
			await setupRequirements(aiEnabledRequirements);

			await aura.page.route('**/types/credentials.json', async (route) => {
				const response = await route.fetch();
				const credentials = (await response.json()) as Array<
					{ name?: string } & Record<string, unknown>
				>;
				const index = credentials.findIndex((c) => c.name === 'microsoftOutlookOAuth2Api');
				if (index >= 0) {
					credentials[index] = {
						...credentials[index],
						__overwrittenProperties: ['authUrl', 'accessTokenUrl', 'clientId', 'clientSecret'],
					};
				}
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(credentials),
				});
			});

			await aura.page.goto('/workflow/new');
			await aura.canvas.addInitialNodeToCanvas(MANUAL_TRIGGER_NODE_NAME);
			await aura.canvas.addNode('Microsoft Outlook', { action: 'Get a calendar' });

			await aura.ndv.clickCreateNewCredential();

			await expect(aura.canvas.credentialModal.oauthConnectButton).toHaveCount(1);
			await expect(aura.canvas.credentialModal.getCredentialInputs()).toHaveCount(2);
			await expect(aura.aiAssistant.getCredentialEditAssistantButton()).toHaveCount(0);
		});
	});
});
