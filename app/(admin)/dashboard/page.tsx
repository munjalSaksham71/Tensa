import Link from 'next/link';
import { ensureSeedPage, platform } from '@/src/web/platform-instance.js';

export default function DashboardPage() {
  ensureSeedPage();
  const pages = platform.pageService.listPages();
  const publishedCount = pages.filter((page) => page.status === 'published').length;

  return (
    <div className="page-wrap">
      <div className="header-row">
        <h1>Dashboard</h1>
        <Link className="ghost-link" href="/home">
          Open public home
        </Link>
      </div>

      <section className="dashboard-stats">
        <article className="stat-card">
          <p>Total Pages</p>
          <h3>{pages.length}</h3>
        </article>
        <article className="stat-card">
          <p>Published</p>
          <h3>{publishedCount}</h3>
        </article>
      </section>

      <div className="panel page-list-panel">
        <h3>Pages</h3>
        <div className="stack page-list">
          {pages.map((page) => {
            const updated = new Date(page.updatedAt).toLocaleString();

            return (
              <Link key={page.id} href={`/pages/${page.id}/edit`} className="page-row-link">
                <div>
                  <strong>{page.title}</strong>
                  <p className="muted">/{page.slug}</p>
                </div>
                <div className="page-row-meta">
                  <span className={`status-pill ${page.status}`}>{page.status}</span>
                  <small>Updated {updated}</small>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
