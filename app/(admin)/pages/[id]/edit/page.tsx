import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditorShell } from '@/src/editor-ui/EditorShell';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

export default function EditPage({ params }: { params: { id: string } }) {
  ensureSeedPage();
  const page = platform.pageService.getPageById(params.id);
  if (!page) return notFound();

  return (
    <div className="page-wrap">
      <div className="header-row">
        <h1>Edit Page</h1>
        <Link className="simple-link" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
      <EditorShell pageId={page.id} pageTitle={page.title} initialBlocks={page.blocks} />
    </div>
  );
}
