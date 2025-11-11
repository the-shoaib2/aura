import type { TagEntity, WorkflowTagMapping } from '@aura/db';

export type ExportableTags = { tags: TagEntity[]; mappings: WorkflowTagMapping[] };
