#!/usr/bin/env node

const { spawnSync } = require('child_process');

const auraNodeBin = require.resolve('.bin/aura-node');

const result = spawnSync(auraNodeBin, ['new', ...process.argv.slice(2)], {
	stdio: 'inherit',
});

process.exit(result.status ?? 1);
