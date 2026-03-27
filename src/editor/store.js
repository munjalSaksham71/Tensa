import { cloneTree, findBlockById, findPathById, insertAtPath, movePath, removeAtPath } from './tree.js';

/** @typedef {import('../core/types.js').BlockNode} BlockNode */

/**
 * @typedef {Object} EditorState
 * @property {BlockNode[]} blocks
 * @property {string | null} selectedBlockId
 */

/**
 * @typedef {Object} EditorStore
 * @property {() => EditorState} getState
 * @property {(listener: (state: EditorState) => void) => () => void} subscribe
 * @property {(block: BlockNode, path?: number[]) => void} addBlock
 * @property {(sourcePath: number[], destinationPath: number[]) => void} moveBlock
 * @property {(blockId: string, patch: Record<string, unknown>) => void} updateBlockProps
 * @property {(blockId: string) => void} deleteBlock
 * @property {(blockId: string | null) => void} selectBlock
 * @property {() => boolean} undo
 * @property {() => boolean} redo
 */

/**
 * @param {EditorState=} initialState
 * @returns {EditorStore}
 */
export function createEditorStore(initialState = { blocks: [], selectedBlockId: null }) {
  /** @type {EditorState} */
  let state = {
    blocks: cloneTree(initialState.blocks),
    selectedBlockId: initialState.selectedBlockId ?? null,
  };

  /** @type {EditorState[]} */
  const undoStack = [];
  /** @type {EditorState[]} */
  const redoStack = [];

  const listeners = new Set();

  const snapshot = () => ({
    blocks: cloneTree(state.blocks),
    selectedBlockId: state.selectedBlockId,
  });

  const emit = () => {
    for (const listener of listeners) listener(snapshot());
  };

  const commit = (mutator) => {
    undoStack.push(snapshot());
    redoStack.length = 0;
    mutator();
    emit();
  };

  return {
    getState: () => snapshot(),

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    addBlock(block, path = [state.blocks.length]) {
      commit(() => {
        const tree = cloneTree(state.blocks);
        insertAtPath(tree, path, block);
        state = { ...state, blocks: tree };
      });
    },

    moveBlock(sourcePath, destinationPath) {
      commit(() => {
        const tree = cloneTree(state.blocks);
        movePath(tree, sourcePath, destinationPath);
        state = { ...state, blocks: tree };
      });
    },

    updateBlockProps(blockId, patch) {
      commit(() => {
        const tree = cloneTree(state.blocks);
        const block = findBlockById(tree, blockId);
        if (!block) throw new Error(`Unknown block id: ${blockId}`);

        block.props = { ...block.props, ...patch };
        state = { ...state, blocks: tree };
      });
    },

    deleteBlock(blockId) {
      commit(() => {
        const tree = cloneTree(state.blocks);
        const path = findPathById(tree, blockId);
        if (!path) throw new Error(`Unknown block id: ${blockId}`);

        removeAtPath(tree, path);
        state = {
          ...state,
          blocks: tree,
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
        };
      });
    },

    selectBlock(blockId) {
      state = { ...state, selectedBlockId: blockId };
      emit();
    },

    undo() {
      if (undoStack.length === 0) return false;

      redoStack.push(snapshot());
      state = undoStack.pop();
      emit();
      return true;
    },

    redo() {
      if (redoStack.length === 0) return false;

      undoStack.push(snapshot());
      state = redoStack.pop();
      emit();
      return true;
    },
  };
}
