/** @typedef {import('../core/types.js').BlockDefinition} BlockDefinition */

/**
 * Runtime registry for block definitions.
 */
export class BlockRegistry {
  #definitions = new Map();

  /**
   * @param {BlockDefinition} definition
   */
  register(definition) {
    if (!definition?.type) {
      throw new Error('Block definition must include a non-empty type.');
    }

    if (this.#definitions.has(definition.type)) {
      throw new Error(`Block type "${definition.type}" is already registered.`);
    }

    this.#definitions.set(definition.type, definition);
    return definition;
  }

  /**
   * @param {string} type
   */
  get(type) {
    return this.#definitions.get(type);
  }

  list() {
    return Array.from(this.#definitions.values());
  }

  /**
   * @param {string} parentType
   * @param {string} childType
   */
  allowsChild(parentType, childType) {
    const parent = this.get(parentType);
    if (!parent) return false;
    if (!parent.canHaveChildren) return false;
    if (!parent.allowedChildren || parent.allowedChildren.length === 0) return true;
    return parent.allowedChildren.includes(childType);
  }
}

export const blockRegistry = new BlockRegistry();
