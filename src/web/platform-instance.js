import { TensaPlatform } from '../cms/platform.js';

export const platform = new TensaPlatform();

const adminUser = { id: 'demo-admin', role: 'admin' };

function createSeedBlocks() {
  return [
    { id: 'heading_seed', type: 'heading', props: { text: 'Welcome to Tensa', level: 1 }, children: [] },
    {
      id: 'paragraph_seed',
      type: 'paragraph',
      props: { text: 'This page is editable in the admin dashboard and renders publicly from published data.' },
      children: [],
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
