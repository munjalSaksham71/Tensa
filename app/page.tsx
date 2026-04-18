import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="page-wrap landing-wrap">
      <div className="header-row landing-header">
        <h1>Tensa CMS</h1>
      </div>
      <p className="lead-text">
        Build polished, block-powered pages quickly with a beautiful editor and server-rendered public experiences.
      </p>

      <div className="landing-actions">
        <Link className="cta-link" href="/dashboard">
          Open Dashboard
        </Link>
        <Link className="ghost-link" href="/home">
          View Published Home Page
        </Link>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h3>Visual Authoring</h3>
          <p>Create layouts with reusable blocks and schema-driven settings.</p>
        </article>
        <article className="feature-card">
          <h3>Publishing Workflow</h3>
          <p>Draft, publish, and iterate with built-in revision history.</p>
        </article>
        <article className="feature-card">
          <h3>Fast Public Pages</h3>
          <p>Render production pages on the server for clean markup and SEO.</p>
        </article>
      </div>
    </div>
  );
}
