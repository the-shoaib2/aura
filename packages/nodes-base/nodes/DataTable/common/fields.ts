import type { INodeProperties } from 'workflow';

export const DATA_TABLE_ID_FIELD = 'dataTableId';

export const DRY_RUN = {
	displayName: 'Dry Run',
	name: 'dryRun',
	type: 'boolean',
	default: false,
	description:
		'Whether the operation simulates and returns affected rows in their "before" and "after" states',
} satisfies INodeProperties;
