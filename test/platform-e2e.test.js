import test from 'node:test';
import assert from 'node:assert/strict';

import { TensaPlatform } from '../src/cms/platform.js';

const adminUser = { id: 'u_admin', role: 'admin' };
const editorUser = { id: 'u_editor', role: 'editor' };
const viewerUser = { id: 'u_viewer', role: 'viewer' };

test('end-to-end authoring, publishing, theme, media, and rendering flow', () => {
  const platform = new TensaPlatform();
  const events = [];

  platform.plugins.on('page.published', ({ page }) => events.push(`published:${page.slug}`));
  platform.plugins.on('media.uploaded', ({ asset }) => events.push(`media:${asset.filename}`));

  // Phase 1/2: block setup + settings schema integration
  const headingFields = platform.getSettingsFields('heading');
  assert.equal(headingFields.length, 2);
  assert.equal(headingFields[1].control, 'select');

  const page = platform.createPage(editorUser, {
    slug: 'home',
    title: 'Homepage',
    blocks: [
      { id: 'b1', type: 'heading', props: { text: 'Hello', level: 1 }, children: [] },
      { id: 'b2', type: 'paragraph', props: { text: 'Welcome to Tensa' }, children: [] },
    ],
  });

  platform.saveDraft(editorUser, page.id, {
    blocks: [
      ...page.blocks,
      { id: 'b3', type: 'button', props: { label: 'Get started', href: '/start' }, children: [] },
    ],
    seo: { title: 'Tensa Home', description: 'Fast CMS pages' },
  });

  // Phase 4: media + theme settings + plugin hooks
  const media = platform.uploadMedia(editorUser, {
    filename: 'hero.png',
    mime: 'image/png',
    size: 123456,
    url: 'https://cdn.example.com/hero.png',
    alt: 'Hero image',
  });
  assert.equal(media.filename, 'hero.png');

  const theme = platform.updateTheme(adminUser, {
    globalSections: {
      header: '<header>Global Header</header>',
      footer: '<footer>Global Footer</footer>',
    },
  });
  assert.ok(theme.globalSections.header.includes('Global Header'));

  // Phase 3: publish + public render
  platform.publishPage(editorUser, page.id);
  const html = platform.renderPublishedPage('home');

  assert.ok(html);
  assert.ok(html.includes('<title>Tensa Home</title>'));
  assert.ok(html.includes('<header>Global Header</header>'));
  assert.ok(html.includes('<h1>Hello</h1>'));
  assert.ok(html.includes('Get started'));
  assert.ok(html.includes('<footer>Global Footer</footer>'));

  assert.deepEqual(events, ['media:hero.png', 'published:home']);
});

test('enforces role-based permissions', () => {
  const platform = new TensaPlatform();

  assert.throws(
    () =>
      platform.createPage(viewerUser, {
        slug: 'blocked',
        title: 'Blocked',
        blocks: [],
      }),
    /Forbidden: missing capability pages:write/,
  );

  const page = platform.createPage(editorUser, {
    slug: 'legal',
    title: 'Legal',
    blocks: [],
  });

  assert.throws(
    () => platform.updateTheme(editorUser, { siteName: 'Nope' }),
    /Forbidden: missing capability settings:write/,
  );

  const published = platform.publishPage(editorUser, page.id);
  assert.equal(published.status, 'published');
});
