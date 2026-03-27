import Link from 'next/link';
import { EditorShell } from '@/src/editor-ui/EditorShell';
import { ensureSeedPage } from '@/src/web/platform-instance.js';

export default function DashboardPage() {
  const seedPage = ensureSeedPage();

  return (
    <div className="page-wrap">
      <div className="header-row">
        <h1>Dashboard</h1>
        <Link className="simple-link" href="/home">
          Open published page
        </Link>
      </div>
      <EditorShell pageId={seedPage.id} initialBlocks={seedPage.blocks} />
    </div>
  );
}
