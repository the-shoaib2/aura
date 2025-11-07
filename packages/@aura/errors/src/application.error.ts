import callsites from 'callsites';

export class ApplicationError extends Error {
	readonly level: 'error' | 'warning' = 'error';

	readonly timestamp: number;

	readonly context: Record<string, unknown>;

	constructor(message: string, options?: { level?: 'error' | 'warning'; cause?: Error }) {
		super(message, { cause: options?.cause });
		this.name = this.constructor.name;
		this.level = options?.level ?? 'error';
		this.timestamp = Date.now();
		this.context = this.getContext();
		Error.captureStackTrace(this, this.constructor);
	}

	private getContext(): Record<string, unknown> {
		const sites = callsites();
		const site = sites[2];
		if (!site) return {};

		return {
			file: site.getFileName(),
			line: site.getLineNumber(),
			column: site.getColumnNumber(),
			function: site.getFunctionName(),
		};
	}
}
