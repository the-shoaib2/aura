import { defineConfig, mergeConfig } from 'vite';
import { vitestConfig } from '@aura/vitest-config/node';

export default mergeConfig(defineConfig({}), vitestConfig);
