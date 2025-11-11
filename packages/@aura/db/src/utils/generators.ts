import type { InstanceType } from '@aura/constants';
import { ALPHABET } from 'workflow';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet(ALPHABET, 16);

export function generateNanoId() {
	return nanoid();
}

export function generateHostInstanceId(instanceType: InstanceType) {
	return `${instanceType}-${nanoid()}`;
}
