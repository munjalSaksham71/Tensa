import { NextResponse } from 'next/server';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

const adminUser = { id: 'demo-admin', role: 'admin' };

export async function GET() {
  ensureSeedPage();
  return NextResponse.json({ pages: platform.pageService.listPages() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const page = platform.createPage(adminUser, {
    slug: body.slug,
    title: body.title,
    blocks: body.blocks ?? [],
  });

  return NextResponse.json({ page }, { status: 201 });
}
