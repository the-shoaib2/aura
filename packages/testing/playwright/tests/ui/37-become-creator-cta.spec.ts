import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

test.describe('Become creator CTA', () => {
	test('should not show the CTA if user is not eligible', async ({ aura, setupRequirements }) => {
		const notEligibleRequirements: TestRequirements = {
			intercepts: {
				cta: {
					url: '**/rest/cta/become-creator',
					response: false,
				},
			},
		};

		await setupRequirements(notEligibleRequirements);
		await aura.goHome();

		await expect(aura.becomeCreatorCTA.getBecomeTemplateCreatorCta()).toBeHidden();
	});

	test('should show the CTA if the user is eligible', async ({ aura, setupRequirements }) => {
		const eligibleRequirements: TestRequirements = {
			intercepts: {
				cta: {
					url: '**/rest/cta/become-creator',
					response: true,
				},
			},
		};

		await setupRequirements(eligibleRequirements);
		await aura.goHome();
		await aura.sideBar.expand();

		await expect(aura.becomeCreatorCTA.getBecomeTemplateCreatorCta()).toBeVisible();

		await aura.becomeCreatorCTA.closeBecomeTemplateCreatorCta();

		await expect(aura.becomeCreatorCTA.getBecomeTemplateCreatorCta()).toBeHidden();
	});
});
