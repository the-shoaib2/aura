export interface ErrorContext {
	[key: string]: unknown;
}

export interface ErrorOptions {
	level?: 'error' | 'warning';
	cause?: Error;
	context?: ErrorContext;
}
