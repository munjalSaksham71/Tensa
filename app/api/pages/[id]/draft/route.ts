import { NextResponse } from 'next/server';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

const adminUser = { id: 'demo-admin', role: 'admin' };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  ensureSeedPage();
  const { id } = await params;
  const body = await request.json();
  const page = platform.saveDraft(adminUser, id, {
    title: body.title,
    blocks: body.blocks,
    seo: body.seo,
  });

  return NextResponse.json({ page });
}
