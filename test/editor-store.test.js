import test from 'node:test';
import assert from 'node:assert/strict';

import { createEditorStore } from '../src/editor/store.js';

function textBlock(id, text) {
  return {
    id,
    type: 'paragraph',
    props: { text },
    children: [],
  };
}

test('supports add/update/delete/select flow', () => {
  const store = createEditorStore();

  store.addBlock(textBlock('a', 'hello'));
  store.addBlock(textBlock('b', 'world'));
  store.updateBlockProps('a', { text: 'updated' });
  store.selectBlock('a');
  store.deleteBlock('b');

  const state = store.getState();
  assert.equal(state.selectedBlockId, 'a');
  assert.equal(state.blocks.length, 1);
  assert.equal(state.blocks[0].props.text, 'updated');
});

test('supports move and history undo/redo', () => {
  const store = createEditorStore({
    blocks: [textBlock('a', 'one'), textBlock('b', 'two'), textBlock('c', 'three')],
    selectedBlockId: null,
  });

  store.moveBlock([0], [2]);
  assert.deepEqual(
    store.getState().blocks.map((block) => block.id),
    ['b', 'a', 'c'],
  );

  assert.equal(store.undo(), true);
  assert.deepEqual(
    store.getState().blocks.map((block) => block.id),
    ['a', 'b', 'c'],
  );

  assert.equal(store.redo(), true);
  assert.deepEqual(
    store.getState().blocks.map((block) => block.id),
    ['b', 'a', 'c'],
  );
});

test('clears redo stack after new commit', () => {
  const store = createEditorStore({
    blocks: [textBlock('a', 'one')],
    selectedBlockId: null,
  });

  store.updateBlockProps('a', { text: 'two' });
  assert.equal(store.undo(), true);
  store.updateBlockProps('a', { text: 'three' });

  assert.equal(store.redo(), false);
  assert.equal(store.getState().blocks[0].props.text, 'three');
});
