import { fileTests as runTestFile } from '@lezer/generator/dist/test';
import fs from 'fs';
import path from 'path';

import { auraLanguage } from '../../src/expressions/index';

describe('expressions language', () => {
	const CASES_DIR = __dirname;
	for (const testFile of fs.readdirSync(CASES_DIR)) {
		if (!/\.txt$/.test(testFile)) continue;

		const testFileName = /^[^\.]*/.exec(testFile)![0];
		describe(testFileName, () => {
			for (const { name, run } of runTestFile(
				fs.readFileSync(path.join(CASES_DIR, testFile), 'utf8'),
				testFile,
			)) {
				it(name, () => run(auraLanguage.parser));
			}
		});
	}
});
