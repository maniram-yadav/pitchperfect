'use client';

import { useState } from 'react';
import { useTemplateStore, FormTemplate } from '../../lib/templateStore';

interface TemplateManagerProps {
  onLoad: (values: Record<string, any>) => void;
  onSave: () => Record<string, any>;
}

export default function TemplateManager({ onLoad, onSave }: TemplateManagerProps) {
  const { templates, lastUsedTemplateId, saveTemplate, deleteTemplate, setLastUsed } = useTemplateStore();
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedId, setSelectedId] = useState<string>(lastUsedTemplateId ?? '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const name = templateName.trim();
    if (!name) return;
    const values = onSave();
    const saved = saveTemplate(name, values);
    setSelectedId(saved.id);
    setLastUsed(saved.id);
    setTemplateName('');
    setShowSaveInput(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLoad = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setSelectedId(id);
    setLastUsed(id);
    onLoad(template.values);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTemplate(id);
    if (selectedId === id) setSelectedId('');
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <span className="text-sm font-medium text-amber-800 whitespace-nowrap">📁 Templates</span>

      {/* Template selector */}
      <div className="flex-1 min-w-48">
        <select
          value={selectedId}
          onChange={(e) => handleLoad(e.target.value)}
          className="w-full text-sm border border-amber-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-amber-500"
        >
          <option value="">— select a template —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.id === lastUsedTemplateId ? ' ★' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Delete selected */}
      {selectedId && (
        <button
          type="button"
          onClick={(e) => handleDelete(e, selectedId)}
          className="text-xs px-2 py-1.5 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      )}

      {/* Save flow */}
      {showSaveInput ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Template name…"
            autoFocus
            className="text-sm border border-amber-300 rounded px-2 py-1.5 w-40 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!templateName.trim()}
            className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => { setShowSaveInput(false); setTemplateName(''); }}
            className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSaveInput(true)}
          className={`text-xs px-3 py-1.5 rounded border transition-colors whitespace-nowrap ${
            saveSuccess
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
          }`}
        >
          {saveSuccess ? '✓ Saved!' : '+ Save as Template'}
        </button>
      )}
    </div>
  );
}
