import {
	AGENT_NODE_NAME,
	EDIT_FIELDS_SET_NODE_NAME,
	MANUAL_CHAT_TRIGGER_NODE_NAME,
	AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
	AI_MEMORY_WINDOW_BUFFER_MEMORY_NODE_NAME,
	AI_MEMORY_POSTGRES_NODE_NAME,
	AI_TOOL_CALCULATOR_NODE_NAME,
	AI_OUTPUT_PARSER_AUTO_FIXING_NODE_NAME,
	AI_TOOL_CODE_NODE_NAME,
	AI_TOOL_WIKIPEDIA_NODE_NAME,
	BASIC_LLM_CHAIN_NODE_NAME,
	CHAT_TRIGGER_NODE_DISPLAY_NAME,
	SCHEDULE_TRIGGER_NODE_NAME,
} from '../../config/constants';
import { test, expect } from '../../fixtures/base';
import type { auraPage } from '../../pages/auraPage';

// Helper functions for common operations
async function addOpenAILanguageModelWithCredentials(
	aura: auraPage,
	parentNode: string,
	options: { exactMatch?: boolean; closeNDV?: boolean } = { exactMatch: true, closeNDV: false },
) {
	await aura.canvas.addSupplementalNodeToParent(
		AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
		'ai_languageModel',
		parentNode,
		options,
	);

	await aura.credentialsComposer.createFromNdv({
		apiKey: 'abcd',
	});
	await aura.ndv.clickBackToCanvasButton();
}

async function waitForWorkflowSuccess(aura: auraPage, timeout = 3000) {
	await aura.notifications.waitForNotificationAndClose('Workflow executed successfully', {
		timeout,
	});
}

async function executeChatAndWaitForResponse(aura: auraPage, message: string) {
	await aura.canvas.logsPanel.sendManualChatMessage(message);
	await waitForWorkflowSuccess(aura);
}

async function verifyChatMessages(aura: auraPage, expectedCount: number, inputMessage?: string) {
	const messages = aura.canvas.getManualChatMessages();
	await expect(messages).toHaveCount(expectedCount);
	if (inputMessage) {
		await expect(messages.first()).toContainText(inputMessage);
	}
	await expect(messages.last()).toBeVisible();
	return messages;
}

async function verifyLogsPanelEntries(aura: auraPage, expectedEntries: string[]) {
	await expect(aura.canvas.logsPanel.getLogEntries().first()).toBeVisible();
	await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(expectedEntries.length);
	for (let i = 0; i < expectedEntries.length; i++) {
		await expect(aura.canvas.logsPanel.getLogEntries().nth(i)).toHaveText(expectedEntries[i]);
	}
}

async function setupBasicAgentWorkflow(aura: auraPage, additionalNodes: string[] = []) {
	await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

	// Add additional nodes if specified
	for (const nodeName of additionalNodes) {
		await aura.canvas.addSupplementalNodeToParent(nodeName, 'ai_tool', AGENT_NODE_NAME, {
			closeNDV: true,
		});
	}

	// Always add OpenAI Language Model
	await addOpenAILanguageModelWithCredentials(aura, AGENT_NODE_NAME);
}

test.use({
	addContainerCapability: {
		proxyServerEnabled: true,
	},
});
test.describe('Langchain Integration @capability:proxy', () => {
	test.beforeEach(async ({ aura, proxyServer }) => {
		await proxyServer.clearAllExpectations();
		await proxyServer.loadExpectations('langchain');
		await aura.canvas.openNewWorkflow();
	});

	test.describe('Workflow Execution Behavior', () => {
		test('should not open chat modal', async ({ aura }) => {
			await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			await aura.canvas.addSupplementalNodeToParent(
				AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
				'ai_languageModel',
				AGENT_NODE_NAME,
				{ exactMatch: true, closeNDV: true },
			);

			await aura.canvas.clickExecuteWorkflowButton();
			await expect(aura.canvas.getManualChatModal()).toBeHidden();
		});

		test('should remove test workflow button', async ({ aura }) => {
			await aura.canvas.addNode(SCHEDULE_TRIGGER_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(EDIT_FIELDS_SET_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			await aura.canvas.addSupplementalNodeToParent(
				AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
				'ai_languageModel',
				AGENT_NODE_NAME,
				{ exactMatch: true, closeNDV: true },
			);

			await aura.canvas.disableNodeFromContextMenu(SCHEDULE_TRIGGER_NODE_NAME);
			await expect(aura.canvas.getExecuteWorkflowButton()).toBeHidden();
		});
	});

	test.describe('Node Connection and Configuration', () => {
		test('should add nodes to all Agent node input types', async ({ aura }) => {
			const agentSubNodes = [
				AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
				AI_MEMORY_WINDOW_BUFFER_MEMORY_NODE_NAME,
				AI_TOOL_CALCULATOR_NODE_NAME,
				AI_OUTPUT_PARSER_AUTO_FIXING_NODE_NAME,
			];
			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: false });

			await aura.ndv.checkParameterCheckboxInputByName('hasOutputParser');
			await aura.ndv.clickBackToCanvasButton();
			await aura.canvas.addSupplementalNodeToParent(
				AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
				'ai_languageModel',
				AGENT_NODE_NAME,
				{ exactMatch: true, closeNDV: true },
			);

			await aura.canvas.addSupplementalNodeToParent(
				AI_MEMORY_WINDOW_BUFFER_MEMORY_NODE_NAME,
				'ai_memory',
				AGENT_NODE_NAME,
				{ closeNDV: true },
			);

			await aura.canvas.addSupplementalNodeToParent(
				AI_TOOL_CALCULATOR_NODE_NAME,
				'ai_tool',
				AGENT_NODE_NAME,
				{ closeNDV: true },
			);

			await aura.canvas.addSupplementalNodeToParent(
				AI_OUTPUT_PARSER_AUTO_FIXING_NODE_NAME,
				'ai_outputParser',
				AGENT_NODE_NAME,
				{ closeNDV: true },
			);
			for (const nodeName of agentSubNodes) {
				await expect(aura.canvas.connectionBetweenNodes(nodeName, AGENT_NODE_NAME)).toBeAttached();
			}
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2 + agentSubNodes.length); // Chat Trigger + Agent + 4 inputs
		});

		test('should add multiple tool nodes to Agent node tool input type', async ({ aura }) => {
			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			const tools = [
				AI_TOOL_CALCULATOR_NODE_NAME,
				AI_TOOL_CODE_NODE_NAME,
				AI_TOOL_CODE_NODE_NAME,
				AI_TOOL_WIKIPEDIA_NODE_NAME,
			];

			for (const tool of tools) {
				await aura.canvas.addSupplementalNodeToParent(tool, 'ai_tool', AGENT_NODE_NAME, {
					closeNDV: true,
				});
				await expect(aura.canvas.connectionBetweenNodes(tool, AGENT_NODE_NAME)).toBeAttached();
			}

			// Chat Trigger + Agent + Tools
			await expect(aura.canvas.getCanvasNodes()).toHaveCount(2 + tools.length);
		});
	});

	test.describe('Auto-add Behavior', () => {
		test('should auto-add chat trigger and basic LLM chain when adding LLM node', async ({
			aura,
		}) => {
			await aura.canvas.addNode(AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME, { closeNDV: true });

			await expect(
				aura.canvas.connectionBetweenNodes(
					CHAT_TRIGGER_NODE_DISPLAY_NAME,
					BASIC_LLM_CHAIN_NODE_NAME,
				),
			).toBeAttached();

			await expect(
				aura.canvas.connectionBetweenNodes(
					AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME,
					BASIC_LLM_CHAIN_NODE_NAME,
				),
			).toBeAttached();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		});

		test('should not auto-add nodes if AI nodes are already present', async ({ aura }) => {
			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME, { closeNDV: true });

			await expect(
				aura.canvas.connectionBetweenNodes(CHAT_TRIGGER_NODE_DISPLAY_NAME, AGENT_NODE_NAME),
			).toBeAttached();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		});

		test('should not auto-add nodes if ChatTrigger is already present', async ({ aura }) => {
			await aura.canvas.addNode(MANUAL_CHAT_TRIGGER_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			await aura.canvas.addNode(AI_LANGUAGE_MODEL_OPENAI_CHAT_MODEL_NODE_NAME, { closeNDV: true });

			await expect(
				aura.canvas.connectionBetweenNodes(CHAT_TRIGGER_NODE_DISPLAY_NAME, AGENT_NODE_NAME),
			).toBeAttached();

			await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		});
	});

	test.describe('Chat Execution and Interaction', () => {
		test('should be able to open and execute Basic LLM Chain node', async ({ aura }) => {
			await aura.canvas.addNode(BASIC_LLM_CHAIN_NODE_NAME, { closeNDV: true });

			await addOpenAILanguageModelWithCredentials(aura, BASIC_LLM_CHAIN_NODE_NAME);

			await aura.canvas.openNode(BASIC_LLM_CHAIN_NODE_NAME);
			const inputMessage = 'Hello!';

			await aura.ndv.execute();
			await executeChatAndWaitForResponse(aura, inputMessage);

			// Verify chat message appears
			await expect(aura.canvas.getManualChatLatestBotMessage()).toBeVisible();
		});
		test('should be able to open and execute Agent node', async ({ aura }) => {
			await setupBasicAgentWorkflow(aura);

			const inputMessage = 'Hello!';
			await aura.canvas.clickManualChatButton();
			await executeChatAndWaitForResponse(aura, inputMessage);

			// Verify chat message appears
			await expect(aura.canvas.getManualChatLatestBotMessage()).toBeVisible();
		});
		test('should add and use Manual Chat Trigger node together with Agent node', async ({
			aura,
		}) => {
			await setupBasicAgentWorkflow(aura);

			const inputMessage = 'Hello!';
			await aura.canvas.clickManualChatButton();
			await executeChatAndWaitForResponse(aura, inputMessage);

			await verifyChatMessages(aura, 2, inputMessage);
			await verifyLogsPanelEntries(aura, [
				'When chat message received',
				'AI Agent',
				'OpenAI Chat Model',
			]);

			await aura.canvas.closeManualChatModal();
			await expect(aura.canvas.logsPanel.getLogEntries()).toBeHidden();
			await expect(aura.canvas.getManualChatInput()).toBeHidden();
		});
	});

	test.describe('Tool Usage Notifications', () => {
		test('should show tool info notice if no existing tools were used during execution', async ({
			aura,
		}) => {
			await setupBasicAgentWorkflow(aura, [AI_TOOL_CALCULATOR_NODE_NAME]);
			await aura.canvas.openNode(AGENT_NODE_NAME);

			const inputMessage = 'Hello!';
			await aura.ndv.execute();
			await executeChatAndWaitForResponse(aura, inputMessage);

			await aura.canvas.closeManualChatModal();
			await aura.canvas.openNode(AGENT_NODE_NAME);

			await expect(aura.ndv.getRunDataInfoCallout()).toBeVisible();
		});
		test('should not show tool info notice if tools were used during execution', async ({
			aura,
		}) => {
			await aura.canvas.addNode(MANUAL_CHAT_TRIGGER_NODE_NAME, { closeNDV: true });
			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: false });
			await expect(aura.ndv.getRunDataInfoCallout()).toBeHidden();
			await aura.ndv.clickBackToCanvasButton();

			await addOpenAILanguageModelWithCredentials(aura, AGENT_NODE_NAME);

			await aura.canvas.addSupplementalNodeToParent(
				AI_TOOL_CALCULATOR_NODE_NAME,
				'ai_tool',
				AGENT_NODE_NAME,
				{ closeNDV: true },
			);

			const inputMessage = 'What is 1000 * 10?';
			await aura.canvas.clickManualChatButton();
			await executeChatAndWaitForResponse(aura, inputMessage);

			await aura.canvas.closeManualChatModal();
			await aura.canvas.openNode(AGENT_NODE_NAME);

			await expect(aura.ndv.getRunDataInfoCallout()).toBeHidden();
		});
	});

	// Create a ticket for this for AI team to fix
	// eslint-disable-next-line playwright/no-skipped-test
	test.skip('Error Handling and Logs Display', () => {
		// Helper function to set up the agent workflow with Postgres error configuration
		async function setupAgentWorkflowWithPostgresError(aura: auraPage) {
			await aura.canvas.addNode(AGENT_NODE_NAME, { closeNDV: true });

			// Add Calculator Tool (required for OpenAI model)
			await aura.canvas.addSupplementalNodeToParent(
				AI_TOOL_CALCULATOR_NODE_NAME,
				'ai_tool',
				AGENT_NODE_NAME,
				{ closeNDV: true },
			);

			// Add and configure Postgres Memory
			await aura.canvas.addSupplementalNodeToParent(
				AI_MEMORY_POSTGRES_NODE_NAME,
				'ai_memory',
				AGENT_NODE_NAME,
				{ closeNDV: false },
			);

			await aura.credentialsComposer.createFromNdv({
				password: 'testtesttest',
			});

			await aura.ndv.getParameterInput('sessionIdType').click();
			await aura.page.getByRole('option', { name: 'Define below' }).click();
			await aura.ndv.getParameterInput('sessionKey').locator('input').fill('asdasd');
			await aura.ndv.clickBackToCanvasButton();

			// Add and configure OpenAI Language Model
			await addOpenAILanguageModelWithCredentials(aura, AGENT_NODE_NAME);

			await aura.canvas.clickZoomToFitButton();
		}

		// Helper function to assert logs tab is active
		async function assertLogsTabIsActive(aura: auraPage) {
			await expect(aura.ndv.getOutputDataContainer()).toBeVisible();
			await expect(aura.ndv.getAiOutputModeToggle()).toBeVisible();

			const radioButtons = aura.ndv.getAiOutputModeToggle().locator('[role="radio"]');
			await expect(radioButtons).toHaveCount(2);
			await expect(radioButtons.nth(1)).toHaveAttribute('aria-checked', 'true');
		}

		// Helper function to assert error message is visible
		async function assertErrorMessageVisible(aura: auraPage) {
			await expect(
				aura.ndv.getOutputPanel().getByTestId('node-error-message').first(),
			).toBeVisible();
			await expect(
				aura.ndv.getOutputPanel().getByTestId('node-error-message').first(),
			).toContainText('Error in sub-node');
		}

		test('should open logs tab by default when there was an error', async ({ aura }) => {
			await setupAgentWorkflowWithPostgresError(aura);

			const inputMessage = 'Test the code tool';

			// Execute workflow with chat trigger
			await aura.canvas.clickManualChatButton();
			await executeChatAndWaitForResponse(aura, inputMessage);

			// Check that messages and logs are displayed
			const messages = await verifyChatMessages(aura, 2, inputMessage);
			await expect(messages.last()).toContainText(
				'[ERROR: The service refused the connection - perhaps it is offline]',
			);

			await expect(aura.canvas.logsPanel.getLogEntries().first()).toBeVisible();
			await expect(aura.canvas.logsPanel.getLogEntries()).toHaveCount(3);
			await expect(aura.canvas.logsPanel.getSelectedLogEntry()).toHaveText('AI Agent');
			await expect(aura.canvas.logsPanel.outputPanel.get()).toContainText(
				AI_MEMORY_POSTGRES_NODE_NAME,
			);

			await aura.canvas.closeManualChatModal();

			// Open the AI Agent node to see the logs
			await aura.canvas.openNode(AGENT_NODE_NAME);

			// Assert that logs tab is active and error is displayed
			await assertLogsTabIsActive(aura);
			await assertErrorMessageVisible(aura);
		});

		test('should switch to logs tab on error, when NDV is already opened', async ({ aura }) => {
			// Remove the auto-added chat trigger
			await aura.canvas.addNode(MANUAL_CHAT_TRIGGER_NODE_NAME, { closeNDV: false });

			// Set manual trigger to output standard pinned data
			await aura.ndv.getEditPinnedDataButton().click();
			await aura.ndv.savePinnedData();
			await aura.ndv.close();

			// Set up the same workflow components but with manual trigger
			await setupAgentWorkflowWithPostgresError(aura);

			// Open the AI Agent node
			await aura.canvas.openNode(AGENT_NODE_NAME);
			await aura.ndv.getParameterInput('promptType').click();
			await aura.page.getByRole('option', { name: 'Define below' }).click();
			await aura.ndv.getParameterInput('text').locator('textarea').fill('Some text');
			await aura.ndv.execute();
			await waitForWorkflowSuccess(aura);

			// Assert that logs tab is active and error is displayed
			await assertLogsTabIsActive(aura);
			await assertErrorMessageVisible(aura);
		});
	});

	test.describe('Advanced Workflow Features', () => {
		test('should render runItems for sub-nodes and allow switching between them', async ({
			aura,
		}) => {
			await aura.start.fromImportedWorkflow('In_memory_vector_store_fake_embeddings.json');
			await aura.canvas.clickZoomToFitButton();
			await aura.canvas.deselectAll();

			await aura.canvas.executeNode('Populate VS');
			await waitForWorkflowSuccess(aura);

			const assertInputOutputTextExists = async (text: string) => {
				await expect(aura.ndv.getOutputPanel()).toContainText(text);
				await expect(aura.ndv.getInputPanel()).toContainText(text);
			};

			const assertInputOutputTextNotExists = async (text: string) => {
				await expect(aura.ndv.getOutputPanel()).not.toContainText(text);
				await expect(aura.ndv.getInputPanel()).not.toContainText(text);
			};

			await aura.canvas.openNode('Character Text Splitter');

			await expect(aura.ndv.getOutputRunSelector()).toBeVisible();
			await expect(aura.ndv.getInputRunSelector()).toBeVisible();
			await expect(aura.ndv.getInputRunSelectorInput()).toHaveValue('3 of 3');
			await expect(aura.ndv.getOutputRunSelectorInput()).toHaveValue('3 of 3');
			await assertInputOutputTextExists('Kyiv');
			await assertInputOutputTextNotExists('Berlin');
			await assertInputOutputTextNotExists('Prague');

			await aura.ndv.changeOutputRunSelector('2 of 3');
			await assertInputOutputTextExists('Berlin');
			await assertInputOutputTextNotExists('Kyiv');
			await assertInputOutputTextNotExists('Prague');

			await aura.ndv.changeOutputRunSelector('1 of 3');
			await assertInputOutputTextExists('Prague');
			await assertInputOutputTextNotExists('Berlin');
			await assertInputOutputTextNotExists('Kyiv');

			await aura.ndv.toggleInputRunLinking();
			await aura.ndv.changeOutputRunSelector('2 of 3');
			await expect(aura.ndv.getInputRunSelectorInput()).toHaveValue('1 of 3');
			await expect(aura.ndv.getOutputRunSelectorInput()).toHaveValue('2 of 3');
			await expect(aura.ndv.getInputPanel()).toContainText('Prague');
			await expect(aura.ndv.getInputPanel()).not.toContainText('Berlin');

			await expect(aura.ndv.getOutputPanel()).toContainText('Berlin');
			await expect(aura.ndv.getOutputPanel()).not.toContainText('Prague');

			await aura.ndv.toggleInputRunLinking();
			await expect(aura.ndv.getInputRunSelectorInput()).toHaveValue('1 of 3');
			await expect(aura.ndv.getOutputRunSelectorInput()).toHaveValue('1 of 3');
			await assertInputOutputTextExists('Prague');
			await assertInputOutputTextNotExists('Berlin');
			await assertInputOutputTextNotExists('Kyiv');
		});

		test('should execute up to Node 1 when using partial execution', async ({ aura }) => {
			await aura.start.fromImportedWorkflow('Test_workflow_chat_partial_execution.json');
			await aura.canvas.clickZoomToFitButton();

			// Check that chat modal is not initially visible
			await expect(aura.canvas.getManualChatModal().locator('main')).toBeHidden();

			// Open Node 1 and execute it
			await aura.canvas.openNode('Node 1');
			await aura.ndv.execute();
			// Chat modal should now be visible
			await expect(aura.canvas.getManualChatModal().locator('main')).toBeVisible();

			// Send first message
			await aura.canvas.logsPanel.sendManualChatMessage('Test');
			await expect(aura.canvas.getManualChatLatestBotMessage()).toContainText('this_my_field_1');

			// Refresh session
			await aura.page.getByTestId('refresh-session-button').click();
			await expect(aura.canvas.getManualChatMessages()).not.toBeAttached();

			// Send another message
			await aura.canvas.logsPanel.sendManualChatMessage('Another test');
			await expect(aura.canvas.getManualChatLatestBotMessage()).toContainText('this_my_field_3');
			await expect(aura.canvas.getManualChatLatestBotMessage()).toContainText('this_my_field_4');
		});
	});

	test('should keep the same session when switching tabs', async ({ aura }) => {
		await aura.start.fromImportedWorkflow('Test_workflow_chat_partial_execution.json');
		await aura.canvas.clickZoomToFitButton();

		await aura.canvas.logsPanel.open();

		// Send a message
		await aura.canvas.logsPanel.sendManualChatMessage('Test');
		await expect(aura.canvas.getManualChatLatestBotMessage()).toContainText('this_my_field');

		await aura.canvas.clickExecutionsTab();

		await aura.canvas.clickEditorTab();
		await expect(aura.canvas.getManualChatLatestBotMessage()).toContainText('this_my_field');

		// Refresh session
		await aura.page.getByTestId('refresh-session-button').click();
		await expect(aura.canvas.getManualChatMessages()).not.toBeAttached();
	});
});
