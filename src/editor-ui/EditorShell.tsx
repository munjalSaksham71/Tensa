'use client';

import { useEffect, useState } from 'react';
import { platform } from '@/src/web/platform-instance.js';
import { buildBlockFromDefinition } from '@/src/web/block-factory.js';

type EditorShellProps = {
  pageId: string;
  initialBlocks: Array<{
    id: string;
    type: string;
    props: Record<string, unknown>;
    styles?: Record<string, string | number>;
    children?: unknown[];
  }>;
};

const adminUser = { id: 'demo-admin', role: 'admin' };

export function EditorShell({ pageId, initialBlocks }: EditorShellProps) {
  const [state, setState] = useState(() => platform.editorStore.getState());
  const [saveStatus, setSaveStatus] = useState('Unsaved changes');

  useEffect(() => {
    const unsubscribe = platform.editorStore.subscribe((nextState) => setState(nextState));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const currentState = platform.editorStore.getState();
    if (currentState.blocks.length === 0 && initialBlocks.length > 0) {
      for (const block of initialBlocks) {
        platform.editorStore.addBlock(block);
      }
    }
  }, [initialBlocks]);

  const selectedBlock = state.selectedBlockId
    ? state.blocks.find((block) => block.id === state.selectedBlockId) ?? null
    : null;

  const availableBlocks = platform.registry.list();
  const selectedFields = selectedBlock ? platform.getSettingsFields(selectedBlock.type) : [];

  const onAddBlock = (blockType: string) => {
    const definition = platform.registry.get(blockType);
    if (!definition) return;

    platform.editorStore.addBlock(buildBlockFromDefinition(definition));
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
        <h3>Blocks</h3>
        <div className="stack">
          {availableBlocks.map((block) => (
            <button key={block.type} className="ghost-btn" onClick={() => onAddBlock(block.type)}>
              + {block.name}
            </button>
          ))}
        </div>
      </aside>

      <main className="panel panel-center">
        <div className="toolbar">
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
                <span>{block.type}</span>
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
          <div className="stack">
            {selectedFields.map((field) => (
              <label key={field.name} className="field">
                <span>{field.label}</span>
                <input
                  type={field.control === 'number' ? 'number' : 'text'}
                  value={String(selectedBlock.props[field.name] ?? '')}
                  onChange={(event) => {
                    const nextValue = field.control === 'number' ? Number(event.target.value) : event.target.value;
                    platform.editorStore.updateBlockProps(selectedBlock.id, { [field.name]: nextValue });
                    setSaveStatus('Unsaved changes');
                  }}
                />
              </label>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
