import { TensaPlatform } from '../cms/platform.js';

export const platform = new TensaPlatform();

const adminUser = { id: 'demo-admin', role: 'admin' };

function createSeedBlocks() {
  return [
    {
      id: 'section_hero',
      type: 'section',
      props: {},
      styles: {
        padding: '56px 0 32px',
      },
      children: [
        {
          id: 'heading_seed',
          type: 'heading',
          props: { text: 'Launch high-converting pages in minutes', level: 1 },
          children: [],
        },
        {
          id: 'paragraph_seed',
          type: 'paragraph',
          props: {
            text: 'Tensa is a visual, block-based CMS for teams who want beautiful pages without rebuilding everything from scratch.',
          },
          children: [],
        },
        {
          id: 'button_seed',
          type: 'button',
          props: { label: 'Open Admin Dashboard', href: '/dashboard' },
          children: [],
        },
      ],
    },
    {
      id: 'section_showcase',
      type: 'section',
      props: {},
      styles: {
        padding: '16px 0 0',
      },
      children: [
        {
          id: 'showcase_image',
          type: 'image',
          props: {
            src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
            alt: 'Team reviewing a website dashboard',
          },
          children: [],
        },
      ],
    },
    {
      id: 'section_features',
      type: 'section',
      props: {},
      styles: {
        padding: '12px 0 8px',
      },
      children: [
        {
          id: 'features_heading',
          type: 'heading',
          props: { text: 'Why teams pick Tensa', level: 2 },
          children: [],
        },
        {
          id: 'feature_one',
          type: 'paragraph',
          props: { text: '• Drag-and-drop editor with reusable blocks and instant preview.' },
          children: [],
        },
        {
          id: 'feature_two',
          type: 'paragraph',
          props: { text: '• Draft, publish, and version history workflows out of the box.' },
          children: [],
        },
        {
          id: 'feature_three',
          type: 'paragraph',
          props: { text: '• Fast, SEO-friendly public pages powered by server rendering.' },
          children: [],
        },
      ],
    },
  ];
}

export function ensureSeedPage() {
  const existing = platform.pageService.getPageBySlug('home', 'published');
  if (existing) return existing;

  const page = platform.createPage(adminUser, {
    slug: 'home',
    title: 'Home',
    blocks: createSeedBlocks(),
  });

  platform.publishPage(adminUser, page.id);
  return platform.pageService.getPageById(page.id);
}
