export type ASTAfterHook = (ast: unknown, dataNode: any) => void;

export declare class Tournament {
	constructor(
		errorHandler?: (e: Error) => void,
		a?: unknown,
		b?: unknown,
		hooks?: { before: ASTAfterHook[]; after: ASTAfterHook[] },
	);
	errorHandler: (e: Error) => void;
	execute(expr: string, data: unknown): any;
	toString(): string;
}

export const astBuilders: {
	identifier(name: string): any;
	memberExpression(object: any, property: any, computed?: boolean): any;
	callExpression(callee: any, args: any[]): any;
};

export function astVisit(ast: unknown, visitor: Record<string, (...args: any[]) => void>): void;
