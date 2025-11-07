import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in production, this would be a database)
let mockPlugins = [
	{
		id: '1',
		name: 'Slack Integration',
		enabled: true,
		version: '1.2.0',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'Email Provider',
		enabled: true,
		version: '2.0.1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		name: 'Calendar Sync',
		enabled: false,
		version: '1.0.0',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export async function GET(request: NextRequest) {
	try {
		return NextResponse.json({
			plugins: mockPlugins,
			total: mockPlugins.length,
		});
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const newPlugin = {
			id: String(mockPlugins.length + 1),
			name: body.name || `Plugin ${mockPlugins.length + 1}`,
			enabled: body.enabled !== undefined ? body.enabled : false,
			version: body.version || '1.0.0',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		mockPlugins.push(newPlugin);
		return NextResponse.json(newPlugin, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to install plugin' }, { status: 500 });
	}
}
