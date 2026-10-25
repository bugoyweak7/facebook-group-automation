import React, { useState, useMemo } from 'react';
import { Group, GroupPrivacy } from '../../types/group';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ListPlus,
  ClipboardPaste,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Copy,
  FileCode2,
} from 'lucide-react';
import {
  parseBulkGroupText,
  exportGroupsToJson,
  SAMPLE_10_GROUPS_TEXT,
  SAMPLE_20_GROUPS_TEXT,
} from '../../services/groups/bulk-group-importer';
import { useToast } from '../common/Toast';

export interface BulkAddGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGroups: Group[];
  onImportGroups: (groups: Group[]) => Promise<void>;
  onProceedToPost?: (groupIds: string[]) => void;
}

export const BulkAddGroupsModal: React.FC<BulkAddGroupsModalProps> = ({
  isOpen,
  onClose,
  existingGroups,
  onImportGroups,
  onProceedToPost,
}) => {
  const toast = useToast();

  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('General');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('PUBLIC');
  const [autoSelect, setAutoSelect] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewList, setShowPreviewList] = useState(true);

  // Live parsed result
  const summary = useMemo(() => {
    return parseBulkGroupText(inputText, existingGroups, category, privacy, autoSelect);
  }, [inputText, existingGroups, category, privacy, autoSelect]);

  // Load sample 10 groups
  const handleLoadSample10 = () => {
    setInputText(SAMPLE_10_GROUPS_TEXT);
    setCategory('Buy & Sell');
    toast.info('Loaded 10 example Facebook group templates');
  };

  // Load sample 20 groups
  const handleLoadSample20 = () => {
    setInputText(SAMPLE_20_GROUPS_TEXT);
    setCategory('Marketplace');
    toast.info('Loaded 20 example Facebook group templates');
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setInputText(prev => (prev.trim() ? prev + '\n' + text.trim() : text.trim()));
        toast.success('Pasted links from clipboard!');
      } else {
        toast.warning('Clipboard is empty or does not contain text');
      }
    } catch {
      toast.error('Could not access clipboard. Please press Ctrl+V directly.');
    }
  };

  // Clear text
  const handleClear = () => {
    setInputText('');
  };

  // Submit and save groups
  const handleSubmit = async () => {
    if (summary.groupsToCreate.length === 0) {
      toast.error('No valid new groups found to add. Please check your links.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onImportGroups(summary.groupsToCreate);
      const addedCount = summary.groupsToCreate.length;
      toast.success(`Successfully added ${addedCount} groups to your extension!`);

      const createdIds = summary.groupsToCreate.map(g => g.id);
      setInputText('');
      onClose();

      // If user wants to post immediately
      if (onProceedToPost && autoSelect && createdIds.length > 0) {
        // Optional quick prompt or proceed
      }
    } catch (err: any) {
      toast.error('Failed to save groups: ' + (err?.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Bulk Add Facebook Groups (একসাথে ১০/২০টি গ্রুপ যোগ করুন)"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Helper Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            <span>একসাথে ১০, ২০ বা তার বেশি গ্রুপ যোগ করার সহজ অপশন</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            নিচের বক্সে প্রতি লাইনে একটি করে ফেসবুক গ্রুপ লিংক দিন, অথবা অন্য ডিভাইস থেকে কপি করা JSON কোড পেস্ট করুন।
            এক্সটেনশন স্বয়ংক্রিয়ভাবে নাম, আইডি যাচাই করে ডুপ্লিকেট বাদ দিয়ে সব গ্রুপ সেভ করে দেবে।
          </p>
        </div>

        {/* Quick Presets Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleLoadSample10}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Layers size={13} />
              <span>+ ১০টি ডেমো গ্রুপ</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample20}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Layers size={13} />
              <span>+ ২০টি ডেমো গ্রুপ</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ClipboardPaste size={13} className="text-emerald-400" />
              <span>Paste Clipboard</span>
            </button>

            {existingGroups.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  const json = exportGroupsToJson(existingGroups);
                  await navigator.clipboard.writeText(json);
                  toast.success(`Copied JSON of ${existingGroups.length} existing groups!`);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 active:scale-95"
                title="Copy all currently saved groups as JSON"
              >
                <Copy size={13} className="text-amber-400" />
                <span>Copy Current as JSON</span>
              </button>
            )}
          </div>

          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>মুছুন (Clear)</span>
            </button>
          )}
        </div>

        {/* Big Textarea */}
        <div className="relative">
          <textarea
            rows={7}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`https://www.facebook.com/groups/dhakabuysell/\nhttps://www.facebook.com/groups/bangladeshmarket/\nবা অন্য ডিভাইস থেকে কপি করা JSON কোড:\n[\n  { "name": "Dhaka Market", "url": "https://facebook.com/groups/dhakasell" }\n]`}
            className="w-full p-3.5 bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
          <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
            {summary.totalLines} lines
          </div>
        </div>

        {/* Category & Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Category (ক্যাটাগরি)
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Buy & Sell, Clothing..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Privacy (প্রাইভেসি)
            </label>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value as GroupPrivacy)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="PUBLIC">Public Group (পাবলিক)</option>
              <option value="PRIVATE">Private Group (প্রাইভেট)</option>
            </select>
          </div>

          <div className="flex flex-col justify-center gap-1.5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSelect}
                onChange={e => setAutoSelect(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs text-slate-300 font-medium">
                Auto-select for posting (পোস্টের জন্য নির্বাচিত রাখুন)
              </span>
            </label>
          </div>
        </div>

        {/* Live Analysis Counters */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Valid Groups</span>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {summary.validItems.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
              <AlertTriangle size={15} className="text-amber-400" />
              <span>Duplicates</span>
            </div>
            <span className="text-sm font-bold font-mono text-amber-400">
              {summary.duplicateItems.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
              <XCircle size={15} className="text-rose-400" />
              <span>Invalid</span>
            </div>
            <span className="text-sm font-bold font-mono text-rose-400">
              {summary.invalidItems.length}
            </span>
          </div>
        </div>

        {/* Detected Groups Preview List */}
        {summary.validItems.length > 0 && showPreviewList && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">
                Preview ({summary.validItems.length} groups to add):
              </span>
              <span className="text-[11px] text-slate-500">
                Scroll to view all
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/60">
              {summary.validItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 pt-1.5 pb-1 first:pt-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                      {item.cleanUrl}
                    </span>
                    <Badge variant="success" size="sm">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<ListPlus size={16} />}
            isLoading={isSubmitting}
            disabled={summary.validItems.length === 0}
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 font-bold px-6"
          >
            {summary.validItems.length > 0
              ? `Import & Save ${summary.validItems.length} Groups Now`
              : 'Add Groups'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
