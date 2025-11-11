import { test, expect } from '../../fixtures/base';
import type { TestRequirements } from '../../Types';

const requirements: TestRequirements = {
	workflow: {
		'Switch_node_with_null_connection.json': 'Switch Node with Null Connection',
	},
};

test.describe('ADO-2929 can load Switch nodes', () => {
	test('can load workflows with Switch nodes with null at connection index @auth:owner', async ({
		aura,
		setupRequirements,
	}) => {
		await setupRequirements(requirements);
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(3);
		await aura.canvas.deleteNodeByName('Switch');
		await expect(aura.canvas.getCanvasNodes()).toHaveCount(2);
	});
});
