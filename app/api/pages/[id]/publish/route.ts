import { NextResponse } from 'next/server';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

const adminUser = { id: 'demo-admin', role: 'admin' };

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  ensureSeedPage();
  const page = platform.publishPage(adminUser, params.id);
  return NextResponse.json({ page });
}
