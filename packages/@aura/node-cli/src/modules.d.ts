declare module 'eslint-plugin-aura-nodes-base' {
	import type { ESLint } from 'eslint';

	const plugin: ESLint.Plugin & {
		configs: {
			community: {
				rules: Record<string, Linter.RuleEntry>;
			};
			credentials: {
				rules: Record<string, Linter.RuleEntry>;
			};
			nodes: {
				rules: Record<string, Linter.RuleEntry>;
			};
		};
	};

	export default plugin;
}
