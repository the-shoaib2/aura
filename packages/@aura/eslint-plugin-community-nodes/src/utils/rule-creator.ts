import { ESLintUtils } from '@typescript-eslint/utils';

const REPO_URL = 'https://github.com/aura';
const DOCS_PATH = 'blob/master/packages/@aura/eslint-plugin-community-nodes/docs/rules';

export const createRule = ESLintUtils.RuleCreator((name) => `${REPO_URL}/${DOCS_PATH}/${name}.md`);
