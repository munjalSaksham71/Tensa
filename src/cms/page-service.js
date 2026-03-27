import { cloneTree } from '../editor/tree.js';

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class PageService {
  #pages = new Map();
  #versions = new Map();

  createPage({ slug, title, blocks = [], authorId = 'system' }) {
    if (!slug) throw new Error('Slug is required.');
    if (this.getPageBySlug(slug)) throw new Error(`Slug already exists: ${slug}`);

    const page = {
      id: createId('page'),
      slug,
      title,
      status: 'draft',
      blocks: cloneTree(blocks),
      createdBy: authorId,
      updatedBy: authorId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      publishedAt: null,
      seo: { title, description: '' },
    };

    this.#pages.set(page.id, page);
    this.#versions.set(page.id, []);
    this.createVersion(page.id, authorId, 'Initial draft');

    return structuredClone(page);
  }

  listPages() {
    return Array.from(this.#pages.values()).map((page) => structuredClone(page));
  }

  getPageById(pageId) {
    const page = this.#pages.get(pageId);
    return page ? structuredClone(page) : null;
  }

  getPageBySlug(slug, status = 'published') {
    for (const page of this.#pages.values()) {
      if (page.slug === slug && page.status === status) return structuredClone(page);
    }

    return null;
  }

  updateDraft(pageId, { title, blocks, seo }, authorId = 'system') {
    const page = this.#pages.get(pageId);
    if (!page) throw new Error(`Unknown page: ${pageId}`);

    if (title !== undefined) page.title = title;
    if (blocks !== undefined) page.blocks = cloneTree(blocks);
    if (seo !== undefined) page.seo = { ...page.seo, ...seo };
    page.updatedBy = authorId;
    page.updatedAt = nowIso();

    return structuredClone(page);
  }

  publish(pageId, authorId = 'system') {
    const page = this.#pages.get(pageId);
    if (!page) throw new Error(`Unknown page: ${pageId}`);

    page.status = 'published';
    page.publishedAt = nowIso();
    page.updatedBy = authorId;
    page.updatedAt = nowIso();

    this.createVersion(pageId, authorId, 'Published');
    return structuredClone(page);
  }

  createVersion(pageId, authorId = 'system', note = '') {
    const page = this.#pages.get(pageId);
    if (!page) throw new Error(`Unknown page: ${pageId}`);

    const versions = this.#versions.get(pageId) ?? [];
    const version = {
      id: createId('ver'),
      pageId,
      blocks: cloneTree(page.blocks),
      status: page.status,
      note,
      createdBy: authorId,
      createdAt: nowIso(),
    };

    versions.push(version);
    this.#versions.set(pageId, versions);
    return structuredClone(version);
  }

  listVersions(pageId) {
    return (this.#versions.get(pageId) ?? []).map((version) => structuredClone(version));
  }

  restoreVersion(pageId, versionId, authorId = 'system') {
    const page = this.#pages.get(pageId);
    if (!page) throw new Error(`Unknown page: ${pageId}`);

    const version = (this.#versions.get(pageId) ?? []).find((item) => item.id === versionId);
    if (!version) throw new Error(`Unknown version: ${versionId}`);

    page.blocks = cloneTree(version.blocks);
    page.updatedBy = authorId;
    page.updatedAt = nowIso();

    this.createVersion(pageId, authorId, `Restored ${versionId}`);
    return structuredClone(page);
  }
}
