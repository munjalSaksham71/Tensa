/** @typedef {import('../core/types.js').BlockNode} BlockNode */

/**
 * @param {BlockNode[]} tree
 * @returns {BlockNode[]}
 */
export function cloneTree(tree) {
  return structuredClone(tree);
}

/**
 * @param {BlockNode[]} tree
 * @param {string} id
 * @returns {BlockNode | null}
 */
export function findBlockById(tree, id) {
  for (const block of tree) {
    if (block.id === id) return block;
    if (block.children?.length) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }

  return null;
}

/**
 * @param {BlockNode[]} tree
 * @param {string} id
 * @returns {number[] | null}
 */
export function findPathById(tree, id) {
  for (let index = 0; index < tree.length; index += 1) {
    const block = tree[index];
    if (block.id === id) return [index];
    if (block.children?.length) {
      const childPath = findPathById(block.children, id);
      if (childPath) return [index, ...childPath];
    }
  }

  return null;
}

/**
 * @param {BlockNode[]} tree
 * @param {number[]} path
 * @returns {BlockNode[]}
 */
function getSiblingListAtPath(tree, path) {
  if (path.length === 1) return tree;

  let siblings = tree;
  for (let depth = 0; depth < path.length - 1; depth += 1) {
    const idx = path[depth];
    const parent = siblings[idx];
    if (!parent) throw new Error(`Invalid path: ${path.join('.')}`);
    if (!parent.children) parent.children = [];
    siblings = parent.children;
  }

  return siblings;
}

/**
 * @param {BlockNode[]} tree
 * @param {number[]} path
 * @param {BlockNode} block
 */
export function insertAtPath(tree, path, block) {
  const siblings = getSiblingListAtPath(tree, path);
  const index = path[path.length - 1];
  siblings.splice(index, 0, block);
}

/**
 * @param {BlockNode[]} tree
 * @param {number[]} path
 * @returns {BlockNode}
 */
export function removeAtPath(tree, path) {
  const siblings = getSiblingListAtPath(tree, path);
  const index = path[path.length - 1];
  const [removed] = siblings.splice(index, 1);

  if (!removed) {
    throw new Error(`No block found at path ${path.join('.')}`);
  }

  return removed;
}

/**
 * @param {BlockNode[]} tree
 * @param {number[]} sourcePath
 * @param {number[]} destinationPath
 */
export function movePath(tree, sourcePath, destinationPath) {
  const sourceBeforeDestination =
    sourcePath.length === destinationPath.length &&
    sourcePath.slice(0, -1).every((value, i) => value === destinationPath[i]) &&
    sourcePath[sourcePath.length - 1] < destinationPath[destinationPath.length - 1];

  const moved = removeAtPath(tree, sourcePath);
  const adjustedDestination = [...destinationPath];

  if (sourceBeforeDestination) {
    adjustedDestination[adjustedDestination.length - 1] -= 1;
  }

  insertAtPath(tree, adjustedDestination, moved);
}
