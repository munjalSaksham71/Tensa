/**
 * @typedef {"layout"|"content"|"media"|"form"|"custom"} BlockCategory
 */

/**
 * @typedef {Object} BlockNode
 * @property {string} id
 * @property {string} type
 * @property {Record<string, unknown>} props
 * @property {Record<string, string|number>=} styles
 * @property {BlockNode[]=} children
 */

/**
 * @typedef {Object} BlockDefinition
 * @property {string} type
 * @property {string} name
 * @property {BlockCategory} category
 * @property {Record<string, unknown>} propsSchema
 * @property {Record<string, unknown>} defaultProps
 * @property {(props: Record<string, unknown>) => unknown} EditorComponent
 * @property {(props: Record<string, unknown>) => unknown} RenderComponent
 * @property {boolean=} canHaveChildren
 * @property {string[]=} allowedChildren
 * @property {number=} maxChildren
 */

export {};
