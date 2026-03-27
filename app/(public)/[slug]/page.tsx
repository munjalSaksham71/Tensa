import { notFound } from 'next/navigation';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

export default function PublicPage({ params }: { params: { slug: string } }) {
  ensureSeedPage();

  const page = platform.pageService.getPageBySlug(params.slug, 'published');
  if (!page) return notFound();

  const bodyHtml = platform.renderer.renderBlocks(page.blocks);

  return (
    <div className="page-wrap">
      <h1>{page.title}</h1>
      <div className="rendered-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  );
}
