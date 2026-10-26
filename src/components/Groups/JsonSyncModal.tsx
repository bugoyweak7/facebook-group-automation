import React, { useState, useMemo } from 'react';
import { Group } from '../../types/group';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Copy,
  Check,
  ClipboardPaste,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  exportGroupsToJson,
  parseBulkGroupText,
} from '../../services/groups/bulk-group-importer';
import { downloadFile } from '../../utils/helpers';
import { useToast } from '../common/Toast';

export interface JsonSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  accountName?: string;
  onImportGroups: (groups: Group[]) => Promise<void>;
  onReplaceAllGroups?: (groups: Group[]) => Promise<void>;
}

export const JsonSyncModal: React.FC<JsonSyncModalProps> = ({
  isOpen,
  onClose,
  groups,
  accountName,
  onImportGroups,
  onReplaceAllGroups,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'copy' | 'paste'>('copy');
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);

  // Generate exported JSON string
  const exportedJson = useMemo(() => {
    return exportGroupsToJson(groups, accountName, 'pretty');
  }, [groups, accountName]);

  // Live parsed result for pasted JSON
  const parsedSummary = useMemo(() => {
    return parseBulkGroupText(pasteText, importMode === 'merge' ? groups : []);
  }, [pasteText, groups, importMode]);

  // Copy to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopied(true);
      toast.success(`Copied ${groups.length} groups JSON! Now paste on your other device.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy. Please select the text box and press Ctrl+C.');
    }
  };

  // Download JSON file
  const handleDownloadJson = () => {
    if (groups.length === 0) {
      toast.warning('No groups to download.');
      return;
    }
    downloadFile(`facebook_groups_${Date.now()}.json`, exportedJson, 'application/json');
    toast.success('Downloaded group JSON file');
  };

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setPasteText(text.trim());
        toast.success('Pasted JSON from clipboard!');
      } else {
        toast.warning('Clipboard is empty or does not contain text');
      }
    } catch {
      toast.error('Could not access clipboard. Please press Ctrl+V directly.');
    }
  };

  // Perform import
  const handleApplyImport = async () => {
    const hasNew = parsedSummary.groupsToCreate.length > 0;
    const hasUpdates = parsedSummary.groupsToUpdate.length > 0;

    if (!hasNew && !hasUpdates && importMode === 'merge') {
      toast.info('All groups in the pasted JSON are already up-to-date in your saved list.');
      return;
    }

    if (parsedSummary.validItems.length === 0 && importMode === 'replace') {
      toast.error('No valid groups found in the pasted JSON to replace.');
      return;
    }

    setIsImporting(true);
    try {
      if (importMode === 'replace' && onReplaceAllGroups) {
        await onReplaceAllGroups(parsedSummary.groupsToCreate);
        toast.success(`Replaced all groups with ${parsedSummary.groupsToCreate.length} groups from JSON!`);
      } else {
        // Merge mode: apply the complete merged list so both new groups are added and existing groups are updated
        if (onReplaceAllGroups) {
          await onReplaceAllGroups(parsedSummary.mergedGroups);
        } else {
          await onImportGroups(parsedSummary.mergedGroups);
        }

        if (hasNew && hasUpdates) {
          toast.success(`✨ ${parsedSummary.groupsToCreate.length} new groups added and ${parsedSummary.groupsToUpdate.length} existing groups updated!`);
        } else if (hasNew) {
          toast.success(`✨ Successfully added ${parsedSummary.groupsToCreate.length} new groups from JSON!`);
        } else {
          toast.success(`✨ Successfully updated ${parsedSummary.groupsToUpdate.length} existing groups with new JSON data!`);
        }
      }
      setPasteText('');
      onClose();
    } catch (err: any) {
      toast.error('Import failed: ' + (err?.message || String(err)));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔄 Cross-Device Group Transfer (JSON কপি ও পেস্ট)"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 -mx-6 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'copy'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy size={14} />
            <span>১. এই ডিভাইসের গ্রুপ JSON কপি করুন ({groups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste size={14} />
            <span>২. অন্য ডিভাইস থেকে JSON পেস্ট করুন</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COPY JSON */}
        {/* ========================================================================= */}
        {activeTab === 'copy' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Sparkles size={15} className="text-indigo-400" />
                <span>অন্য ডিভাইসে গ্রুপ নিতে এই কোডটি কপি করুন</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                নিচের বাটনে ক্লিক করে কোডটি কপি করে মেসেঞ্জার, টেলিগ্রাম, ইমেইল বা নোটপ্যাডে রেখে দিন। অন্য ডিভাইসের এক্সটেনশনে গিয়ে শুধু <strong>"২. অন্য ডিভাইস থেকে JSON পেস্ট করুন"</strong> অপশনে পেস্ট করলেই সাথে সাথে সব গ্রুপ যুক্ত হয়ে যাবে।
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FileCode2 size={15} className="text-indigo-400" />
                <span>Group JSON Export Code</span>
                <Badge variant="success" size="sm">
                  {groups.length} Groups
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download size={13} />}
                  onClick={handleDownloadJson}
                  disabled={groups.length === 0}
                  className="text-xs"
                >
                  Download .json
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  onClick={handleCopyJson}
                  disabled={groups.length === 0}
                  className={`font-bold transition-all text-xs ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {copied ? '✓ Copied to Clipboard!' : 'Copy JSON Code'}
                </Button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <textarea
                readOnly
                rows={9}
                value={groups.length > 0 ? exportedJson : '// No groups available to export.'}
                onClick={e => (e.target as HTMLTextAreaElement).select()}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-indigo-200 leading-relaxed focus:outline-none focus:border-indigo-500 select-all cursor-text shadow-inner"
              />
            </div>

            <div className="text-center text-[11px] text-slate-500">
              Tip: Click inside the box to select all text, or click the <strong>Copy JSON Code</strong> button above.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PASTE & IMPORT JSON */}
        {/* ========================================================================= */}
        {activeTab === 'paste' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">
                  অন্য ডিভাইসের এক্সটেনশন থেকে কপি করা JSON এখানে দিন:
                </span>
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                >
                  <ClipboardPaste size={13} />
                  <span>Paste from Clipboard</span>
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={`Paste JSON code here...\nExample:\n{\n  "version": "1.0.0",\n  "groups": [\n    { "name": "Dhaka Market", "url": "https://facebook.com/groups/dhakasell" }\n  ]\n}`}
              className="w-full p-3 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl font-mono text-xs text-slate-100 placeholder-slate-500 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />

            {/* Live Verification Stats */}
            {pasteText.trim() && (
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>New Groups</span>
                  </div>
                  <span className="text-base font-bold font-mono text-emerald-400 pt-0.5">
                    {parsedSummary.groupsToCreate.length}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[10px] text-blue-300 font-semibold">
                    <RefreshCw size={12} className="text-blue-400" />
                    <span>Updates</span>
                  </div>
                  <span className="text-base font-bold font-mono text-blue-400 pt-0.5">
                    {parsedSummary.groupsToUpdate.length}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <Check size={12} className="text-slate-400" />
                    <span>Identical</span>
                  </div>
                  <span className="text-base font-bold font-mono text-slate-400 pt-0.5">
                    {Math.max(0, parsedSummary.duplicateItems.length - parsedSummary.groupsToUpdate.length)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[10px] text-rose-300 font-semibold">
                    <XCircle size={12} className="text-rose-400" />
                    <span>Invalid</span>
                  </div>
                  <span className="text-base font-bold font-mono text-rose-400 pt-0.5">
                    {parsedSummary.invalidItems.length}
                  </span>
                </div>
              </div>
            )}

            {/* Merge vs Replace Mode */}
            <div className="flex items-center gap-4 px-1 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-indigo-600 focus:ring-0"
                />
                <span>Merge & Update (নতুন গ্রুপ যোগ ও বিদ্যমান গ্রুপ আপডেট)</span>
              </label>

              {onReplaceAllGroups && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-rose-500 focus:ring-0"
                  />
                  <span className="text-rose-300">Replace all groups (আগের সব মুছে এটি রাখুন)</span>
                </label>
              )}
            </div>

            {/* Preview of Detected Groups */}
            {(parsedSummary.groupsToCreate.length > 0 || parsedSummary.groupsToUpdate.length > 0) && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Detected Groups to Process:</span>
                  <span className="text-[10px] text-slate-500">
                    {parsedSummary.groupsToCreate.length} new · {parsedSummary.groupsToUpdate.length} updating
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                  {/* Newly created */}
                  {parsedSummary.groupsToCreate.map((item, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between gap-3 pt-1.5 pb-1 first:pt-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                          +NEW
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                        {item.url}
                      </span>
                    </div>
                  ))}

                  {/* Existing updated */}
                  {parsedSummary.groupsToUpdate.map((item, idx) => (
                    <div key={`upd-${idx}`} className="flex items-center justify-between gap-3 pt-1.5 pb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-bold font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded">
                          UPDATE
                        </span>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                        {item.url}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Action */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
                isLoading={isImporting}
                disabled={
                  importMode === 'merge'
                    ? parsedSummary.groupsToCreate.length === 0 && parsedSummary.groupsToUpdate.length === 0
                    : parsedSummary.validItems.length === 0
                }
                onClick={handleApplyImport}
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 shadow-md shadow-emerald-600/20"
              >
                {parsedSummary.groupsToCreate.length > 0 || parsedSummary.groupsToUpdate.length > 0
                  ? `Import & Save (${parsedSummary.groupsToCreate.length} New, ${parsedSummary.groupsToUpdate.length} Updates)`
                  : 'Import Groups from JSON'}
              </Button>
            </div>
          </div>
        )}

        {/* Modal Close Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isImporting}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
