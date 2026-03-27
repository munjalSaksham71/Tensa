/** @typedef {import('../core/types.js').BlockNode} BlockNode */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function styleObjectToString(styles = {}) {
  return Object.entries(styles)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(';');
}

export class PageRenderer {
  constructor(registry, themeService) {
    this.registry = registry;
    this.themeService = themeService;
  }

  /**
   * @param {BlockNode[]} blocks
   */
  renderBlocks(blocks) {
    return blocks.map((block) => this.renderBlock(block)).join('');
  }

  /**
   * @param {BlockNode} block
   */
  renderBlock(block) {
    const definition = this.registry.get(block.type);
    if (!definition) {
      return `<div data-unknown-block="${escapeHtml(block.type)}"></div>`;
    }

    const html = definition.RenderComponent({
      ...block.props,
      childrenHtml: this.renderBlocks(block.children ?? []),
    });

    const style = styleObjectToString(block.styles);
    if (!style) return html;

    return `<div style="${escapeHtml(style)}">${html}</div>`;
  }

  renderPageDocument({ page, bodyHtml }) {
    const theme = this.themeService.getTheme();
    const title = escapeHtml(page.seo?.title || page.title || 'Untitled');
    const description = escapeHtml(page.seo?.description || '');

    const header = theme.globalSections.header ?? '';
    const footer = theme.globalSections.footer ?? '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
  </head>
  <body>
    ${header}
    <main>${bodyHtml}</main>
    ${footer}
  </body>
</html>`;
  }
}
