import { ESLintUtils } from '@typescript-eslint/utils';

export const MisplacedTypeormImportRule = ESLintUtils.RuleCreator.withoutDocs({
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure `@aura/typeorm` is imported only from within the `@aura/db` package.',
		},
		messages: {
			moveImport: 'Please move this import to `@aura/db`.',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		return {
			ImportDeclaration(node) {
				if (node.source.value === '@aura/typeorm' && !context.filename.includes('@aura/db')) {
					context.report({ node, messageId: 'moveImport' });
				}
			},
		};
	},
});
