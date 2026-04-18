import { NextResponse } from 'next/server';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

const adminUser = { id: 'demo-admin', role: 'admin' };

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeedPage();
  const { id } = await params;
  const page = platform.publishPage(adminUser, id);
  return NextResponse.json({ page });
}
