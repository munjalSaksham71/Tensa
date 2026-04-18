'use client';

import { useEffect, useMemo, useState } from 'react';
import { platform } from '@/src/web/platform-instance.js';
import { buildBlockFromDefinition } from '@/src/web/block-factory.js';

type BlockNode = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, string | number>;
  children?: BlockNode[];
};

type EditorShellProps = {
  pageId: string;
  pageTitle: string;
  initialBlocks: BlockNode[];
};


type SettingsField = {
  name: string;
  label: string;
  control: 'select' | 'number' | 'text';
  options?: Array<string | number>;
};

const adminUser = { id: 'demo-admin', role: 'admin' };

function previewText(block: BlockNode) {
  if (typeof block.props.text === 'string' && block.props.text.length > 0) return block.props.text;
  if (typeof block.props.label === 'string' && block.props.label.length > 0) return block.props.label;
  if (typeof block.props.src === 'string' && block.props.src.length > 0) return block.props.src;
  return 'No content yet';
}

export function EditorShell({ pageId, pageTitle, initialBlocks }: EditorShellProps) {
  const [state, setState] = useState(() => platform.editorStore.getState());
  const [saveStatus, setSaveStatus] = useState('Unsaved changes');

  useEffect(() => {
    const unsubscribe = platform.editorStore.subscribe((nextState) => setState(nextState));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const currentState = platform.editorStore.getState();
    if (currentState.blocks.length === 0 && initialBlocks.length > 0) {
      for (const block of initialBlocks) platform.editorStore.addBlock(block);
    }
  }, [initialBlocks]);

  const availableBlocks = useMemo(() => {
    const categories = new Map<string, ReturnType<typeof platform.registry.list>>();
    for (const block of platform.registry.list()) {
      const list = categories.get(block.category) ?? [];
      list.push(block);
      categories.set(block.category, list);
    }
    return Array.from(categories.entries());
  }, []);

  const selectedIndex = state.blocks.findIndex((block) => block.id === state.selectedBlockId);
  const selectedBlock = selectedIndex >= 0 ? state.blocks[selectedIndex] : null;
  const selectedFields = (selectedBlock ? platform.getSettingsFields(selectedBlock.type) : []) as SettingsField[];

  const onAddBlock = (blockType: string) => {
    const definition = platform.registry.get(blockType);
    if (!definition) return;
    platform.editorStore.addBlock(buildBlockFromDefinition(definition));
    setSaveStatus('Unsaved changes');
  };

  const onMoveSelected = (offset: number) => {
    if (selectedIndex < 0) return;
    const destinationIndex = selectedIndex + offset;
    if (destinationIndex < 0 || destinationIndex >= state.blocks.length) return;
    platform.editorStore.moveBlock([selectedIndex], [destinationIndex]);
    setSaveStatus('Unsaved changes');
  };

  const onDeleteSelected = () => {
    if (!selectedBlock) return;
    platform.editorStore.deleteBlock(selectedBlock.id);
    setSaveStatus('Unsaved changes');
  };

  const onSaveDraft = () => {
    platform.saveDraft(adminUser, pageId, { blocks: state.blocks });
    setSaveStatus('Draft saved');
  };

  const onPublish = () => {
    platform.saveDraft(adminUser, pageId, { blocks: state.blocks });
    platform.publishPage(adminUser, pageId);
    setSaveStatus('Published');
  };

  return (
    <div className="editor-shell">
      <aside className="panel panel-left">
        <h3>Block Palette</h3>
        {availableBlocks.map(([category, blocks]) => (
          <section key={category} className="palette-section">
            <h4>{category}</h4>
            <div className="stack">
              {blocks.map((block) => (
                <button key={block.type} className="ghost-btn" onClick={() => onAddBlock(block.type)}>
                  + {block.name}
                </button>
              ))}
            </div>
          </section>
        ))}
      </aside>

      <main className="panel panel-center">
        <div className="toolbar">
          <strong>{pageTitle}</strong>
          <button className="solid-btn" onClick={() => platform.editorStore.undo()}>
            Undo
          </button>
          <button className="solid-btn" onClick={() => platform.editorStore.redo()}>
            Redo
          </button>
          <button className="solid-btn" onClick={onSaveDraft}>
            Save draft
          </button>
          <button className="solid-btn" onClick={onPublish}>
            Publish
          </button>
          <span className="status">{saveStatus}</span>
        </div>

        <div className="canvas">
          {state.blocks.length === 0 ? (
            <p className="muted">Start by adding a block from the left panel.</p>
          ) : (
            state.blocks.map((block) => (
              <button
                key={block.id}
                className={`block-item ${state.selectedBlockId === block.id ? 'active' : ''}`}
                onClick={() => platform.editorStore.selectBlock(block.id)}
              >
                <div>
                  <strong>{block.type}</strong>
                  <p>{previewText(block)}</p>
                </div>
                <small>{block.id}</small>
              </button>
            ))
          )}
        </div>
      </main>

      <aside className="panel panel-right">
        <h3>Settings</h3>
        {!selectedBlock ? (
          <p className="muted">Select a block to edit its props.</p>
        ) : (
          <>
            <div className="row-actions">
              <button className="ghost-btn" onClick={() => onMoveSelected(-1)}>
                Move up
              </button>
              <button className="ghost-btn" onClick={() => onMoveSelected(1)}>
                Move down
              </button>
              <button className="ghost-btn" onClick={onDeleteSelected}>
                Delete
              </button>
            </div>
            <div className="stack">
              {selectedFields.map((field) => (
                <label key={field.name} className="field">
                  <span>{field.label}</span>
                  {field.control === 'select' ? (
                    <select
                      value={String(selectedBlock.props[field.name] ?? '')}
                      onChange={(event) => {
                        platform.editorStore.updateBlockProps(selectedBlock.id, { [field.name]: event.target.value });
                        setSaveStatus('Unsaved changes');
                      }}
                    >
                      {(field.options ?? []).map((option: string | number) => (
                        <option key={String(option)} value={String(option)}>
                          {String(option)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.control === 'number' ? 'number' : 'text'}
                      value={String(selectedBlock.props[field.name] ?? '')}
                      onChange={(event) => {
                        const nextValue = field.control === 'number' ? Number(event.target.value) : event.target.value;
                        platform.editorStore.updateBlockProps(selectedBlock.id, { [field.name]: nextValue });
                        setSaveStatus('Unsaved changes');
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
