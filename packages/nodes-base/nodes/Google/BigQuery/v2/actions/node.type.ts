import type { AllEntities, Entity } from 'workflow';

type GoogleBigQueryMap = {
	database: 'executeQuery' | 'insert';
};

export type GoogleBigQuery = AllEntities<GoogleBigQueryMap>;

export type GoogleBigQueryDatabase = Entity<GoogleBigQueryMap, 'database'>;
