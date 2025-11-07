import { NextRequest, NextResponse } from 'next/server';

// Mock data store (shared with main route)
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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const plugin = mockPlugins.find((p) => p.id === id);
		if (!plugin) {
			return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
		}
		plugin.enabled = true;
		plugin.updatedAt = new Date().toISOString();
		return NextResponse.json(plugin);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to enable plugin' }, { status: 500 });
	}
}
