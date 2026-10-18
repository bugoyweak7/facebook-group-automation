import React, { useState, useRef } from 'react';
import { PostTemplate } from '../../types/post';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  FileCode2,
  Star,
} from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { extractVariables } from '../../services/template/template-engine';
import { useToast } from '../common/Toast';

interface TemplatesManagerProps {
  templates: PostTemplate[];
  onSaveTemplate: (tpl: PostTemplate) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PostTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const standardVariables = [
    { tag: '{product_name}', label: 'Product Name' },
    { tag: '{price}', label: 'Price' },
    { tag: '{old_price}', label: 'Old Price' },
    { tag: '{description}', label: 'Description' },
    { tag: '{features}', label: 'Features' },
    { tag: '{location}', label: 'Location' },
    { tag: '{delivery_info}', label: 'Delivery' },
    { tag: '{contact_info}', label: 'Contact' },
    { tag: '{call_to_action}', label: 'Call To Action' },
    { tag: '{caption}', label: 'AI Caption' },
  ];

  const handleOpenAdd = (tpl?: PostTemplate) => {
    if (tpl) {
      setEditingTemplate(tpl);
      setName(tpl.name);
      setContent(tpl.content);
      setIsDefault(Boolean(tpl.isDefault));
    } else {
      setEditingTemplate(null);
      setName('New Marketplace Template');
      setContent('{product_name}\n\nPrice: {price}\n\n{description}\n\nLocation: {location}\nContact: {contact_info}\n\n{call_to_action}');
      setIsDefault(false);
    }
    setIsModalOpen(true);
  };

  const handleInsertVariable = (variableTag: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextContent = content.substring(0, start) + variableTag + content.substring(end);
    setContent(nextContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + variableTag.length, start + variableTag.length);
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Template Name and Content are required');
      return;
    }

    const tplToSave: PostTemplate = {
      id: editingTemplate ? editingTemplate.id : generateId('tpl'),
      name: name.trim(),
      content: content.trim(),
      variables: extractVariables(content),
      isDefault,
      createdAt: editingTemplate ? editingTemplate.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveTemplate(tplToSave);
    toast.success(editingTemplate ? 'Template updated' : 'Template created');
    setIsModalOpen(false);
  };

  const handleDuplicate = async (tpl: PostTemplate) => {
    const dupe: PostTemplate = {
      ...tpl,
      id: generateId('tpl'),
      name: `${tpl.name} (Copy)`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await onSaveTemplate(dupe);
    toast.success('Template duplicated');
  };

  const handleSetDefault = async (tpl: PostTemplate) => {
    // If setting default, update this template and others
    for (const t of templates) {
      if (t.id === tpl.id) {
        await onSaveTemplate({ ...t, isDefault: true, updatedAt: Date.now() });
      } else if (t.isDefault) {
        await onSaveTemplate({ ...t, isDefault: false, updatedAt: Date.now() });
      }
    }
    toast.success(`"${tpl.name}" set as default template`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Post Templates</h3>
          <p className="text-xs text-slate-400">
            Create reusable templates with dynamic variables like {'{product_name}'} and {'{price}'}.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => handleOpenAdd()}
        >
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <Card
            key={tpl.id}
            title={
              <div className="flex items-center gap-2">
                <span>{tpl.name}</span>
                {tpl.isDefault && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    Default
                  </span>
                )}
              </div>
            }
            headerAction={
              <div className="flex items-center gap-1">
                {!tpl.isDefault && (
                  <button
                    onClick={() => handleSetDefault(tpl)}
                    title="Set as default template"
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-amber-400"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDuplicate(tpl)}
                  title="Duplicate"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => handleOpenAdd(tpl)}
                  title="Edit"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Edit2 size={13} />
                </button>
                {templates.length > 1 && (
                  <button
                    onClick={() => setDeletingId(tpl.id)}
                    title="Delete"
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-3 text-xs">
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {tpl.content}
              </pre>

              <div className="flex flex-wrap gap-1">
                {tpl.variables?.map(v => (
                  <span
                    key={v}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-mono"
                  >
                    {`{${v}}`}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Post Template'}
        description="Write text and click variable tags below to insert dynamic product placeholders."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Template Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Click to insert dynamic variables into template:
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
              {standardVariables.map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-mono text-[11px] transition"
                  title={`Insert ${v.label}`}
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Template Content *</label>
            <textarea
              ref={textareaRef}
              required
              rows={9}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultTpl"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="isDefaultTpl" className="text-slate-300 cursor-pointer">
              Set as default template for new posts
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await onDeleteTemplate(deletingId);
            toast.info('Template deleted');
            setDeletingId(null);
          }
        }}
        title="Delete Template"
        message="Are you sure you want to delete this template?"
        confirmLabel="Delete"
      />
    </div>
  );
};
