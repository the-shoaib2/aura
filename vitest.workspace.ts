import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['packages/**/vite.config.{js,ts,mjs,mts}', 'packages/**/vitest.config.{js,ts,mjs,mts}', 'services/**/vite.config.{js,ts,mjs,mts}', 'services/**/vitest.config.{js,ts,mjs,mts}', 'apps/**/vite.config.{js,ts,mjs,mts}', 'apps/**/vitest.config.{js,ts,mjs,mts}']);

