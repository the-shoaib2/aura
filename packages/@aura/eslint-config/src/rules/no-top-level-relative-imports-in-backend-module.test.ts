import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoTopLevelRelativeImportsInBackendModuleRule } from './no-top-level-relative-imports-in-backend-module.js';

const ruleTester = new RuleTester();

ruleTester.run(
	'no-top-level-relative-imports-in-backend-module',
	NoTopLevelRelativeImportsInBackendModuleRule,
	{
		valid: [
			{
				code: `
import { Container } from '@aura/di';
import { InstanceSettings } from 'aura-core';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		const { LocalService } = await import('./local.service');
	}
}`,
			},
		],
		invalid: [
			{
				code: `
import { Container } from '@aura/di';
import { LocalService } from './local.service';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		// code
	}
}`,
				errors: [{ messageId: 'placeInsideInit' }],
			},
			{
				code: `
import { BackendModule } from '@aura/decorators';
import { helper } from './helper';
import { config } from './config';

@BackendModule({ name: 'test' })
export class TestModule {
	async init() {
		// code
	}
}`,
				errors: [{ messageId: 'placeInsideInit' }, { messageId: 'placeInsideInit' }],
			},
		],
	},
);
