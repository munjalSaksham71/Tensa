import { NextResponse } from 'next/server';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

const adminUser = { id: 'demo-admin', role: 'admin' };

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  ensureSeedPage();
  const body = await request.json();
  const page = platform.saveDraft(adminUser, params.id, {
    title: body.title,
    blocks: body.blocks,
    seo: body.seo,
  });

  return NextResponse.json({ page });
}
