import Link from 'next/link';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

export default function DashboardPage() {
  ensureSeedPage();
  const pages = platform.pageService.listPages();

  return (
    <div className="page-wrap">
      <div className="header-row">
        <h1>Dashboard</h1>
        <Link className="simple-link" href="/home">
          Open public home
        </Link>
      </div>

      <div className="panel">
        <h3>Pages</h3>
        <div className="stack">
          {pages.map((page) => (
            <Link key={page.id} href={`/pages/${page.id}/edit`} className="ghost-btn">
              {page.title} <small>({page.status})</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
