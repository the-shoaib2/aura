/**
 * @system/file Plugin
 *
 * File read/write, move, delete, zip/unzip operations
 */

import { BaseSystemPlugin } from './base-system-plugin';
import { type ActionDefinition, type IntegrationMetadata } from '../../integration.types';
import { ExecuteParams } from '../../base-integration';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import * as zlib from 'zlib';

const metadata: IntegrationMetadata = {
	name: '@system/file',
	version: '1.0.0',
	category: 'system',
	description: 'File read/write, move, delete, zip/unzip operations',
	tags: ['file', 'system', 'io'],
};

export class SystemFilePlugin extends BaseSystemPlugin {
	metadata = metadata;
	triggers?: undefined;
	credentials?: undefined;

	actions: ActionDefinition[] = [
		{
			name: 'read',
			displayName: 'Read File',
			description: 'Read contents of a file',
			operation: 'read',
			properties: [
				{
					name: 'path',
					displayName: 'File Path',
					type: 'string',
					required: true,
					description: 'Path to the file to read',
				},
				{
					name: 'encoding',
					displayName: 'Encoding',
					type: 'options',
					default: 'utf8',
					options: [
						{ name: 'UTF-8', value: 'utf8' },
						{ name: 'Binary', value: 'binary' },
						{ name: 'Base64', value: 'base64' },
					],
				},
			],
		},
		{
			name: 'write',
			displayName: 'Write File',
			description: 'Write content to a file',
			operation: 'write',
			properties: [
				{
					name: 'path',
					displayName: 'File Path',
					type: 'string',
					required: true,
					description: 'Path to the file to write',
				},
				{
					name: 'content',
					displayName: 'Content',
					type: 'string',
					required: true,
					description: 'Content to write to the file',
				},
				{
					name: 'encoding',
					displayName: 'Encoding',
					type: 'options',
					default: 'utf8',
					options: [
						{ name: 'UTF-8', value: 'utf8' },
						{ name: 'Binary', value: 'binary' },
						{ name: 'Base64', value: 'base64' },
					],
				},
				{
					name: 'append',
					displayName: 'Append',
					type: 'boolean',
					default: false,
					description: 'Append to file instead of overwriting',
				},
			],
		},
		{
			name: 'move',
			displayName: 'Move File',
			description: 'Move or rename a file',
			operation: 'move',
			properties: [
				{
					name: 'source',
					displayName: 'Source Path',
					type: 'string',
					required: true,
					description: 'Path to the source file',
				},
				{
					name: 'destination',
					displayName: 'Destination Path',
					type: 'string',
					required: true,
					description: 'Path to the destination',
				},
			],
		},
		{
			name: 'delete',
			displayName: 'Delete File',
			description: 'Delete a file or directory',
			operation: 'delete',
			properties: [
				{
					name: 'path',
					displayName: 'Path',
					type: 'string',
					required: true,
					description: 'Path to the file or directory to delete',
				},
				{
					name: 'recursive',
					displayName: 'Recursive',
					type: 'boolean',
					default: false,
					description: 'Delete directory recursively',
				},
			],
		},
		{
			name: 'zip',
			displayName: 'Zip Files',
			description: 'Create a zip archive',
			operation: 'zip',
			properties: [
				{
					name: 'source',
					displayName: 'Source Path',
					type: 'string',
					required: true,
					description: 'Path to file or directory to zip',
				},
				{
					name: 'destination',
					displayName: 'Destination Path',
					type: 'string',
					required: true,
					description: 'Path to the output zip file',
				},
			],
		},
		{
			name: 'unzip',
			displayName: 'Unzip Files',
			description: 'Extract a zip archive',
			operation: 'unzip',
			properties: [
				{
					name: 'source',
					displayName: 'Zip File Path',
					type: 'string',
					required: true,
					description: 'Path to the zip file',
				},
				{
					name: 'destination',
					displayName: 'Destination Path',
					type: 'string',
					required: true,
					description: 'Path to extract to',
				},
			],
		},
	];

	protected async executeDarwin(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	protected async executeWindows(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	protected async executeLinux(params: ExecuteParams): Promise<any> {
		return this.executeCommon(params);
	}

	private async executeCommon(params: ExecuteParams): Promise<any> {
		const { operation, parameters } = params;

		switch (operation) {
			case 'read':
				return this.readFile(parameters.path, parameters.encoding || 'utf8');
			case 'write':
				return this.writeFile(
					parameters.path,
					parameters.content,
					parameters.encoding || 'utf8',
					parameters.append || false,
				);
			case 'move':
				return this.moveFile(parameters.source, parameters.destination);
			case 'delete':
				return this.deleteFile(parameters.path, parameters.recursive || false);
			case 'zip':
				return this.zipFiles(parameters.source, parameters.destination);
			case 'unzip':
				return this.unzipFiles(parameters.source, parameters.destination);
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	private async readFile(filePath: string, encoding: string): Promise<string | Buffer> {
		const content = await fs.readFile(filePath, encoding as BufferEncoding);
		return content;
	}

	private async writeFile(
		filePath: string,
		content: string,
		encoding: string,
		append: boolean,
	): Promise<void> {
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, { recursive: true });

		if (append) {
			await fs.appendFile(filePath, content, encoding as BufferEncoding);
		} else {
			await fs.writeFile(filePath, content, encoding as BufferEncoding);
		}
	}

	private async moveFile(source: string, destination: string): Promise<void> {
		const destDir = path.dirname(destination);
		await fs.mkdir(destDir, { recursive: true });
		await fs.rename(source, destination);
	}

	private async deleteFile(filePath: string, recursive: boolean): Promise<void> {
		const stats = await fs.stat(filePath);
		if (stats.isDirectory()) {
			await fs.rmdir(filePath, { recursive });
		} else {
			await fs.unlink(filePath);
		}
	}

	private async zipFiles(source: string, destination: string): Promise<void> {
		// Note: Full zip implementation would require a library like 'archiver'
		// This is a simplified version
		const stats = await fs.stat(source);
		if (stats.isFile()) {
			const readStream = createReadStream(source);
			const writeStream = createWriteStream(destination);
			const gzip = zlib.createGzip();
			await pipeline(readStream, gzip, writeStream);
		} else {
			throw new Error('Directory zipping not yet implemented');
		}
	}

	private async unzipFiles(source: string, destination: string): Promise<void> {
		// Note: Full unzip implementation would require a library like 'yauzl' or 'unzipper'
		// This is a simplified version for gzip
		await fs.mkdir(destination, { recursive: true });
		const readStream = createReadStream(source);
		const writeStream = createWriteStream(path.join(destination, path.basename(source, '.gz')));
		const gunzip = zlib.createGunzip();
		await pipeline(readStream, gunzip, writeStream);
	}
}
