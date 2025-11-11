import { defineConfig, mergeConfig } from 'vite';
import { vitestConfig } from '@aura/vitest-config/frontend';

export default mergeConfig(defineConfig({}), vitestConfig);
