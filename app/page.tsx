import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="page-wrap">
      <div className="header-row">
        <h1>Tensa</h1>
      </div>
      <p>A minimal black-and-white CMS baseline running on Next.js App Router.</p>
      <ul>
        <li>
          <Link className="simple-link" href="/dashboard">
            Open Admin Dashboard
          </Link>
        </li>
        <li>
          <Link className="simple-link" href="/home">
            View Published Home Page
          </Link>
        </li>
      </ul>
    </div>
  );
}
