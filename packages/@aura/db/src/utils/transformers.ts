import { GlobalConfig } from '@aura/config';
import { Container } from '@aura/di';
import type { ValueTransformer, FindOperator } from '@aura/typeorm';
import { jsonParse } from 'workflow';

export const idStringifier = {
	from: (value?: number): string | undefined => value?.toString(),
	to: (
		value: string | FindOperator<unknown> | undefined,
	): number | FindOperator<unknown> | undefined =>
		typeof value === 'string' ? Number(value) : value,
};

export const lowerCaser = {
	from: (value: string): string => value,
	to: (value: string): string => (typeof value === 'string' ? value.toLowerCase() : value),
};

/**
 * Unmarshal JSON as JS object.
 */
export const objectRetriever: ValueTransformer = {
	to: (value: object): object => value,
	from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

/**
 * Transformer for sqlite JSON columns to mimic JSON-as-object behavior
 * from Postgres and MySQL.
 */
const jsonColumn: ValueTransformer = {
	to: (value: object): string | object =>
		Container.get(GlobalConfig).database.type === 'sqlite' ? JSON.stringify(value) : value,
	from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

export const sqlite = { jsonColumn };
