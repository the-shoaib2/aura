import { intro } from '@clack/prompts';

import { CommandTester } from '../../test-utils/command-tester';
import { mockSpawn } from '../../test-utils/mock-child-process';
import { setupTestPackage } from '../../test-utils/package-setup';
import { tmpdirTest } from '../../test-utils/temp-fs';

describe('dev command', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	tmpdirTest(
		'successful dev setup with external-aura flag - links node and starts watcher',
		async ({ tmpdir }) => {
			await setupTestPackage(tmpdir, {
				packageJson: { name: 'test-custom-node' },
			});

			mockSpawn('pnpm', ['link'], { exitCode: 0 });

			await expect(CommandTester.run('dev --external-aura')).rejects.toThrow('EEXIT: 0');

			expect(intro).toHaveBeenCalledWith(expect.stringContaining('aura-node dev'));
		},
	);
});
