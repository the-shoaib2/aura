'use strict';

class Tournament {
	constructor(errorHandler = () => {}, _a, _b, hooks = { before: [], after: [] }) {
		this.errorHandler = errorHandler;
		this.hooks = hooks;
	}
	execute(expr, _data) {
		try {
			// Minimal placeholder evaluator: returns the raw expression content
			if (typeof expr === 'string') {
				const match = expr.match(/^\s*\{\{\s*([\s\S]*?)\s*\}\}\s*$/);
				return match ? match[1] : expr;
			}
			return null;
		} catch (e) {
			this.errorHandler(e);
			throw e;
		}
	}
	toString() {
		return 'OSS Tournament (noop)';
	}
}

const astBuilders = {
	identifier(name) {
		return { type: 'Identifier', name };
	},
	memberExpression(object, property, computed = false) {
		return { type: 'MemberExpression', object, property, computed };
	},
	callExpression(callee, args) {
		return { type: 'CallExpression', callee, arguments: args };
	},
};

function astVisit(_ast, _visitor) {
	// No-op shim
	return;
}

module.exports = {
	Tournament,
	astBuilders,
	astVisit,
};
