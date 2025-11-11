import get from 'lodash/get';
import { constructExecutionMetaData } from 'aura-core';
import type { IDataObject, IExecuteFunctions, IGetNodeParameterOptions, INode } from 'workflow';

export const createMockExecuteFunction = <T = IExecuteFunctions>(
	nodeParameters: IDataObject,
	nodeMock: INode,
	continueBool = false,
) =>
	({
		getNodeParameter(
			parameterName: string,
			_itemIndex: number,
			fallbackValue?: IDataObject,
			options?: IGetNodeParameterOptions,
		) {
			const parameter = options?.extractValue ? `${parameterName}.value` : parameterName;
			return get(nodeParameters, parameter, fallbackValue);
		},
		getNode() {
			return nodeMock;
		},
		continueOnFail() {
			return continueBool;
		},
		helpers: {
			constructExecutionMetaData,
		},
	}) as unknown as T;
