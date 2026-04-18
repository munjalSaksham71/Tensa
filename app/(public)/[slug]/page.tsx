import { notFound } from 'next/navigation';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  ensureSeedPage();
  const { slug } = await params;

  const page = platform.pageService.getPageBySlug(slug, 'published');
  if (!page) return notFound();

  const bodyHtml = platform.renderer.renderBlocks(page.blocks);

  return (
    <div className="page-wrap public-wrap">
      <header className="public-header">
        <p className="muted">Published page</p>
        <h1>{page.title}</h1>
      </header>
      <div className="rendered-page public-rendered" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  );
}
