import { BlockRegistry } from '../blocks/registry.js';
import { createEditorStore } from '../editor/store.js';
import { PageService } from './page-service.js';
import { PermissionService } from './permissions.js';
import { MediaLibrary } from './media-library.js';
import { ThemeService } from './theme.js';
import { PageRenderer } from './renderer.js';
import { PluginSystem } from './plugin-system.js';
import { schemaToFields } from './schema-to-form.js';

function paragraphRender(props) {
  return `<p class="tensa-paragraph">${props.text ?? ''}</p>`;
}

function headingRender(props) {
  const level = Number(props.level ?? 1);
  const safeLevel = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;
  return `<h${safeLevel}>${props.text ?? ''}</h${safeLevel}>`;
}

function imageRender(props) {
  const alt = props.alt ?? '';
  return `<figure class="tensa-image-wrap"><img class="tensa-image" src="${props.src ?? ''}" alt="${alt}" /></figure>`;
}

function sectionRender(props) {
  return `<section class="tensa-section"><div class="section-inner">${props.childrenHtml ?? ''}</div></section>`;
}

function buttonRender(props) {
  return `<a href="${props.href ?? '#'}" class="btn tensa-btn">${props.label ?? 'Button'}</a>`;
}

export class TensaPlatform {
  constructor() {
    this.registry = new BlockRegistry();
    this.pageService = new PageService();
    this.permissionService = new PermissionService();
    this.mediaLibrary = new MediaLibrary();
    this.themeService = new ThemeService();
    this.plugins = new PluginSystem();
    this.renderer = new PageRenderer(this.registry, this.themeService);
    this.editorStore = createEditorStore();

    this.registerCoreBlocks();
  }

  registerCoreBlocks() {
    this.registry.register({
      type: 'heading',
      name: 'Heading',
      category: 'content',
      propsSchema: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', title: 'Text', default: '' },
          level: { type: 'integer', title: 'Level', enum: [1, 2, 3, 4, 5, 6], default: 1 },
        },
      },
      defaultProps: { text: '', level: 1 },
      EditorComponent: () => null,
      RenderComponent: headingRender,
    });

    this.registry.register({
      type: 'paragraph',
      name: 'Paragraph',
      category: 'content',
      propsSchema: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', title: 'Text', default: '' },
        },
      },
      defaultProps: { text: '' },
      EditorComponent: () => null,
      RenderComponent: paragraphRender,
    });

    this.registry.register({
      type: 'image',
      name: 'Image',
      category: 'media',
      propsSchema: {
        type: 'object',
        required: ['src'],
        properties: {
          src: { type: 'string', title: 'Image URL', default: '' },
          alt: { type: 'string', title: 'Alt text', default: '' },
        },
      },
      defaultProps: { src: '', alt: '' },
      EditorComponent: () => null,
      RenderComponent: imageRender,
    });

    this.registry.register({
      type: 'section',
      name: 'Section',
      category: 'layout',
      propsSchema: { type: 'object', properties: {} },
      defaultProps: {},
      canHaveChildren: true,
      EditorComponent: () => null,
      RenderComponent: sectionRender,
    });

    this.registry.register({
      type: 'button',
      name: 'Button',
      category: 'content',
      propsSchema: {
        type: 'object',
        required: ['label'],
        properties: {
          label: { type: 'string', title: 'Label', default: 'Button' },
          href: { type: 'string', title: 'Link', default: '#' },
        },
      },
      defaultProps: { label: 'Button', href: '#' },
      EditorComponent: () => null,
      RenderComponent: buttonRender,
    });
  }

  getSettingsFields(blockType) {
    const definition = this.registry.get(blockType);
    if (!definition) throw new Error(`Unknown block type: ${blockType}`);
    return schemaToFields(definition.propsSchema);
  }

  createPage(user, input) {
    this.permissionService.assert(user, 'pages:write');
    const page = this.pageService.createPage({ ...input, authorId: user.id });
    this.plugins.emit('page.created', { page, user });
    return page;
  }

  saveDraft(user, pageId, draft) {
    this.permissionService.assert(user, 'pages:write');
    const page = this.pageService.updateDraft(pageId, draft, user.id);
    this.pageService.createVersion(pageId, user.id, 'Draft saved');
    this.plugins.emit('page.saved', { page, user });
    return page;
  }

  publishPage(user, pageId) {
    this.permissionService.assert(user, 'pages:publish');
    const page = this.pageService.publish(pageId, user.id);
    this.plugins.emit('page.published', { page, user });
    return page;
  }

  uploadMedia(user, payload) {
    this.permissionService.assert(user, 'media:write');
    const asset = this.mediaLibrary.upload(payload, user.id);
    this.plugins.emit('media.uploaded', { asset, user });
    return asset;
  }

  updateTheme(user, patch) {
    this.permissionService.assert(user, 'settings:write');
    const theme = this.themeService.updateTheme(patch);
    this.plugins.emit('theme.updated', { theme, user });
    return theme;
  }

  renderPublishedPage(slug) {
    const page = this.pageService.getPageBySlug(slug, 'published');
    if (!page) return null;

    const bodyHtml = this.renderer.renderBlocks(page.blocks);
    return this.renderer.renderPageDocument({ page, bodyHtml });
  }
}
