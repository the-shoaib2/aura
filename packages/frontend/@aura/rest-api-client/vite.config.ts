import { defineConfig, mergeConfig } from 'vite';
import { createVitestConfig } from '@aura/vitest-config/frontend';

export default mergeConfig(defineConfig({}), createVitestConfig({ setupFiles: [] }));
