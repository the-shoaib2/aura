# 🚀 aura Playwright Test Writing Cheat Sheet

> **For AI Assistants**: This guide provides quick reference patterns for writing aura Playwright tests using the established architecture.

## Quick Start Navigation Methods

### **aura.start.*** Methods (Test Entry Points)
```typescript
// Start from home page
await aura.start.fromHome();

// Start with blank canvas for new workflow
await aura.start.fromBlankCanvas();

// Start with new project + blank canvas (returns projectId)
const projectId = await aura.start.fromNewProjectBlankCanvas();

// Start with just a new project (no canvas)
const projectId = await aura.start.fromNewProject();

// Import and start from existing workflow JSON
const result = await aura.start.fromImportedWorkflow('simple-webhook-test.json');
const { workflowId, webhookPath } = result;
```

### **aura.navigate.*** Methods (Page Navigation)
```typescript
// Basic navigation
await aura.navigate.toHome();
await aura.navigate.toWorkflow('new');
await aura.navigate.toWorkflows(projectId);

// Settings & admin
await aura.navigate.toVariables();
await aura.navigate.toCredentials(projectId);
await aura.navigate.toLogStreaming();
await aura.navigate.toCommunityNodes();

// Project-specific navigation
await aura.navigate.toProject(projectId);
await aura.navigate.toProjectSettings(projectId);
```

## Common Test Patterns

### **Basic Workflow Test**
```typescript
test('should create and execute workflow', async ({ aura }) => {
  await aura.start.fromBlankCanvas();
  await aura.canvas.addNode('Manual Trigger');
  await aura.canvas.addNode('Set');
  await aura.workflowComposer.executeWorkflowAndWaitForNotification('Success');
});
```

### **Imported Workflow Test**
```typescript
test('should import and test webhook', async ({ aura }) => {
  const { webhookPath } = await aura.start.fromImportedWorkflow('webhook-test.json');

  await aura.canvas.clickExecuteWorkflowButton();
  const response = await aura.page.request.post(`/webhook-test/${webhookPath}`, {
    data: { message: 'Hello' }
  });
  expect(response.ok()).toBe(true);
});
```

### **Project-Scoped Test**
```typescript
test('should create credential in project', async ({ aura }) => {
  const projectId = await aura.start.fromNewProject();
  await aura.navigate.toCredentials(projectId);

  await aura.credentialsComposer.createFromList(
    'Notion API',
    { apiKey: '12345' },
    { name: `cred-${nanoid()}` }
  );
});
```

### **Node Configuration Test**
```typescript
test('should configure HTTP Request node', async ({ aura }) => {
  await aura.start.fromBlankCanvas();
  await aura.canvas.addNode('Manual Trigger');
  await aura.canvas.addNode('HTTP Request');

  await aura.ndv.fillParameterInput('URL', 'https://api.example.com');
  await aura.ndv.close();
  await aura.canvas.saveWorkflow();
});
```

## Test Setup Patterns

### **Feature Flags Setup**
```typescript
test.beforeEach(async ({ aura, api }) => {
  await api.enableFeature('sharing');
  await api.enableFeature('folders');
  await api.enableFeature('projectRole:admin');
  await api.setMaxTeamProjectsQuota(-1);
  await aura.goHome();
});
```

### **API + UI Combined Test**
```typescript
test('should use API-created credential in UI', async ({ aura, api }) => {
  const projectId = await aura.start.fromNewProjectBlankCanvas();

  // Create via API
  await api.credentialApi.createCredential({
    name: 'test-cred',
    type: 'notionApi',
    data: { apiKey: '12345' },
    projectId
  });

  // Verify in UI
  await aura.canvas.addNode('Notion');
  await expect(aura.ndv.getCredentialSelect()).toHaveValue('test-cred');
});
```

### **Error/Edge Case Testing**
```typescript
test('should handle workflow execution error', async ({ aura }) => {
  await aura.start.fromImportedWorkflow('failing-workflow.json');
  await aura.workflowComposer.executeWorkflowAndWaitForNotification('Problem in node');
  await expect(aura.canvas.getErrorIcon()).toBeVisible();
});
```

## Architecture Guidelines

### **Four-Layer UI Testing Architecture**
```
Tests (*.spec.ts)
    ↓ uses
Composables (*Composer.ts) - Business workflows
    ↓ orchestrates
Page Objects (*Page.ts) - UI interactions
    ↓ extends
BasePage - Common utilities
```

### **When to Use Each Layer**
- **Tests**: High-level scenarios, readable business logic
- **Composables**: Multi-step workflows (e.g., `executeWorkflowAndWaitForNotification`)
- **Page Objects**: Simple UI actions (e.g., `clickSaveButton`, `fillInput`)
- **BasePage**: Generic interactions (e.g., `clickByTestId`, `fillByTestId`)

### **Method Naming Conventions**
```typescript
// Page Object Getters (No async, return Locator)
getSearchBar() { return this.page.getByTestId('search'); }

// Page Object Actions (async, return void)
async clickSaveButton() { await this.clickButtonByName('Save'); }

// Page Object Queries (async, return data)
async getNotificationCount(): Promise<number> { /* ... */ }
```

## Quick Reference

### **Most Common Entry Points**
- `aura.start.fromBlankCanvas()` - New workflow from scratch
- `aura.start.fromImportedWorkflow('file.json')` - Test existing workflow
- `aura.start.fromNewProjectBlankCanvas()` - Project-scoped testing

### **Most Common Navigation**
- `aura.navigate.toCredentials(projectId)` - Credential management
- `aura.navigate.toVariables()` - Environment variables
- `aura.navigate.toWorkflow('new')` - New workflow canvas

### **Essential Assertions**
```typescript
// UI state verification
await expect(aura.canvas.canvasPane()).toBeVisible();
await expect(aura.notifications.getNotificationByTitle('Success')).toBeVisible();
await expect(aura.ndv.getCredentialSelect()).toHaveValue(name);

// Node and workflow verification
await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
await expect(aura.canvas.nodeByName('HTTP Request')).toBeVisible();
```

### **Common Composable Methods**
```typescript
// Workflow operations
await aura.workflowComposer.executeWorkflowAndWaitForNotification('Success');
await aura.workflowComposer.createWorkflow('My Workflow');

// Project operations
const { projectName, projectId } = await aura.projectComposer.createProject();

// Credential operations
await aura.credentialsComposer.createFromList('Notion API', { apiKey: '123' });
await aura.credentialsComposer.createFromNdv({ apiKey: '123' });
```

### **Dynamic Data Patterns**
```typescript
// Use nanoid for unique identifiers
import { nanoid } from 'nanoid';
const workflowName = `Test Workflow ${nanoid()}`;
const credentialName = `cred-${nanoid()}`;

// Use timestamps for uniqueness
const projectName = `Project ${Date.now()}`;
```

## AI Guidelines

### **✅ DO**
- Always use `aura.start.*` methods for test entry points
- Use composables for business workflows, not page objects directly in tests
- Use `nanoid()` or timestamps for unique test data
- Follow the 4-layer architecture pattern
- Use proper waiting with `expect().toBeVisible()` instead of `waitForTimeout`

### **❌ DON'T**
- Use raw `page.goto()` instead of navigation helpers
- Mix business logic in page objects (move to composables)
- Use hardcoded selectors in tests (use page object getters)
- Create overly specific methods (keep them reusable)
- Use `any` types or `waitForTimeout`

### **Test Structure Template**
```typescript
import { test, expect } from '../../fixtures/base';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ aura, api }) => {
    // Feature flags and setup
    await api.enableFeature('requiredFeature');
    await aura.goHome();
  });

  test('should perform specific action', async ({ aura }) => {
    // 1. Setup/Navigation
    await aura.start.fromBlankCanvas();

    // 2. Actions using composables
    await aura.workflowComposer.createBasicWorkflow();

    // 3. Assertions
    await expect(aura.notifications.getNotificationByTitle('Success')).toBeVisible();
  });
});
```
