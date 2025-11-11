import { expect, test } from '../../fixtures/base';

test.describe('User API Service', () => {
	test('should create a user with default values', async ({ api }) => {
		const user = await api.users.create();

		expect(user.email).toContain('testuser');
		expect(user.email).toContain('@test.com');
		expect(user.firstName).toBe('Test');
		expect(user.lastName).toContain('User');
		expect(user.role).toContain('member');
	});

	test('should create a user with custom values', async ({ api }) => {
		const customEmail = `custom-${Date.now()}@test.com`;
		const customPassword = 'CustomPass123!';

		const user = await api.users.create({
			email: customEmail,
			password: customPassword,
			firstName: 'John',
			lastName: 'Doe',
			role: 'global:member',
		});

		expect(user.email.toLowerCase()).toBe(customEmail.toLowerCase());
		expect(user.firstName).toBe('John');
		expect(user.lastName).toBe('Doe');
		expect(user.role).toContain('member');
	});

	test('should create a member user by default', async ({ api }) => {
		const user = await api.users.create();

		expect(user.role).toContain('member');
		expect(user.role).toBe('global:member');
	});

	test('should maintain separate sessions for multiple users', async ({ aura, api }) => {
		await aura.navigate.toPersonalSettings();
		const user = await api.users.create();

		await aura.page.reload();
		await expect(aura.settingsPersonal.getUserRole()).toHaveText('Owner');

		// New user page should have test name
		const memberN8n = await aura.start.withUser(user);

		await memberN8n.navigate.toPersonalSettings();
		await expect(memberN8n.settingsPersonal.getUserRole()).toHaveText('Member');

		// aura main should still have owner context
		await aura.page.reload();
		await expect(aura.settingsPersonal.getUserRole()).toHaveText('Owner');

		// user page should still have member role
		await memberN8n.page.reload();
		await expect(memberN8n.settingsPersonal.getUserRole()).toHaveText('Member');
	});
});
