import React, { useState, useMemo } from 'react';
import { Group, GroupStatus } from '../../types/group';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpDown,
  ListPlus,
} from 'lucide-react';
import { validateFacebookGroupUrl, detectDuplicateGroup } from '../../utils/validators';
import { generateId, formatDate } from '../../utils/helpers';
import { parseGroupsCsv, exportGroupsToCsv, CsvImportSummary } from '../../services/csv/csv-parser';
import { downloadFile } from '../../utils/helpers';
import { useToast } from '../common/Toast';

interface GroupsManagerProps {
  groups: Group[];
  onSaveGroup: (group: Group) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onImportGroups: (groups: Group[]) => Promise<void>;
  onOpenGroupUrl: (url: string) => void;
}

export const GroupsManager: React.FC<GroupsManagerProps> = ({
  groups,
  onSaveGroup,
  onDeleteGroup,
  onImportGroups,
  onOpenGroupUrl,
}) => {
  const toast = useToast();

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'postCount' | 'lastPostedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // Single Group Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk add text state
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('General');

  // CSV Import state
  const [csvFileContent, setCsvFileContent] = useState<string>('');
  const [csvSummary, setCsvSummary] = useState<CsvImportSummary | null>(null);
  const [csvSkipDuplicates, setCsvSkipDuplicates] = useState(true);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    groups.forEach(g => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [groups]);

  // Filtered and sorted groups
  const filteredGroups = useMemo(() => {
    return groups
      .filter(g => {
        const matchesSearch =
          searchTerm === '' ||
          g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (g.location && g.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (g.category && g.category.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || g.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }

        valA = (valA as number) || 0;
        valB = (valB as number) || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [groups, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Open single add / edit modal
  const handleOpenAdd = (groupToEdit?: Group) => {
    if (groupToEdit) {
      setEditingGroup(groupToEdit);
      setFormName(groupToEdit.name);
      setFormUrl(groupToEdit.url);
      setFormCategory(groupToEdit.category || 'General');
      setFormLocation(groupToEdit.location || '');
      setFormNotes(groupToEdit.notes || '');
    } else {
      setEditingGroup(null);
      setFormName('');
      setFormUrl('');
      setFormCategory('General');
      setFormLocation('');
      setFormNotes('');
    }
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Submit single group
  const handleSaveSingleGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Group name is required');
      return;
    }

    const valResult = validateFacebookGroupUrl(formUrl);
    if (!valResult.valid) {
      setFormError(valResult.errors.join('; '));
      return;
    }

    const isDuplicate = detectDuplicateGroup(
      valResult.cleanUrl || formUrl,
      groups,
      editingGroup ? editingGroup.id : undefined
    );

    if (isDuplicate) {
      setFormError('A Facebook group with this URL or ID is already in your list');
      return;
    }

    const groupToSave: Group = {
      id: editingGroup ? editingGroup.id : generateId('grp'),
      name: formName.trim(),
      url: valResult.cleanUrl || formUrl.trim(),
      groupId: valResult.groupId,
      category: formCategory.trim() || 'General',
      location: formLocation.trim() || undefined,
      notes: formNotes.trim() || undefined,
      enabled: editingGroup ? editingGroup.enabled : true,
      status: editingGroup ? editingGroup.status : 'READY',
      postCount: editingGroup ? editingGroup.postCount : 0,
      lastPostedAt: editingGroup ? editingGroup.lastPostedAt : undefined,
      createdAt: editingGroup ? editingGroup.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveGroup(groupToSave);
    toast.success(editingGroup ? 'Group updated successfully' : 'Group added successfully');
    setIsAddModalOpen(false);
  };

  // Bulk add submit
  const handleSaveBulk = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.error('Please enter at least one Facebook Group URL');
      return;
    }

    const newGroups: Group[] = [];
    let duplicates = 0;
    let invalids = 0;

    for (const line of lines) {
      // Format: URL or Name, URL
      let name = '';
      let url = line;

      if (line.includes(',')) {
        const parts = line.split(',');
        name = parts[0].trim();
        url = parts[1].trim();
      }

      const val = validateFacebookGroupUrl(url);
      if (!val.valid) {
        invalids++;
        continue;
      }

      if (detectDuplicateGroup(val.cleanUrl || url, [...groups, ...newGroups])) {
        duplicates++;
        continue;
      }

      if (!name) {
        name = (val.groupId || 'Facebook Group').replace(/[-_.]+/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }

      newGroups.push({
        id: generateId('grp'),
        name,
        url: val.cleanUrl || url,
        groupId: val.groupId,
        category: bulkCategory,
        enabled: true,
        status: 'READY',
        postCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (newGroups.length > 0) {
      await onImportGroups(newGroups);
      toast.success(`Imported ${newGroups.length} groups! (Skipped: ${duplicates} duplicates, ${invalids} invalid)`);
      setIsBulkModalOpen(false);
      setBulkText('');
    } else {
      toast.error(`No valid new groups to import. Found ${duplicates} duplicates and ${invalids} invalid URLs.`);
    }
  };

  // CSV file change
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvFileContent(text);
      const summary = parseGroupsCsv(text, groups);
      setCsvSummary(summary);
      setIsCsvModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Confirm CSV Import
  const handleConfirmCsvImport = async () => {
    if (!csvSummary) return;

    const toImport = csvSkipDuplicates ? csvSummary.validRows : [...csvSummary.validRows, ...csvSummary.duplicateRows.map(d => d.row)];

    const created: Group[] = toImport.map(r => {
      const val = validateFacebookGroupUrl(r.url);
      return {
        id: generateId('grp'),
        name: r.name,
        url: val.cleanUrl || r.url,
        groupId: val.groupId,
        category: r.category || 'General',
        location: r.location,
        notes: r.notes,
        enabled: true,
        status: 'READY',
        postCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    await onImportGroups(created);
    toast.success(`Imported ${created.length} groups from CSV!`);
    setIsCsvModalOpen(false);
    setCsvSummary(null);
  };

  // Toggle group enabled
  const handleToggleEnabled = async (group: Group) => {
    const updated: Group = {
      ...group,
      enabled: !group.enabled,
      status: !group.enabled ? 'READY' : 'DISABLED',
      updatedAt: Date.now(),
    };
    await onSaveGroup(updated);
    toast.info(`Group ${updated.enabled ? 'Enabled' : 'Disabled'}`);
  };

  // Export handlers
  const handleExportCsv = () => {
    const csvData = exportGroupsToCsv(groups);
    downloadFile(`ai-group-poster-groups-${Date.now()}.csv`, csvData, 'text/csv');
    toast.success('Groups exported as CSV');
  };

  const handleExportJson = () => {
    const jsonData = JSON.stringify(groups, null, 2);
    downloadFile(`ai-group-poster-groups-${Date.now()}.json`, jsonData, 'application/json');
    toast.success('Groups exported as JSON');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => handleOpenAdd()}
          >
            Add Group
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ListPlus size={14} />}
            onClick={() => setIsBulkModalOpen(true)}
          >
            Bulk Add
          </Button>

          <label className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-3.5 py-2 gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition select-none">
            <Upload size={14} />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvFileChange}
            />
          </label>

          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCsv}
            disabled={groups.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportJson}
            disabled={groups.length === 0}
          >
            Export JSON
          </Button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredGroups.length}</span> of{' '}
          <span className="text-white font-bold">{groups.length}</span> groups
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search group name, URL, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PENDING">Pending</option>
              <option value="POSTED">Posted</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="name">Group Name</option>
              <option value="postCount">Post Count</option>
              <option value="lastPostedAt">Last Posted</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* Groups Table */}
      <Card className="p-0 overflow-hidden">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-semibold text-slate-200">No Facebook Groups Found</p>
            <p className="text-xs mt-1">
              {groups.length === 0
                ? 'Get started by adding your first Facebook group or importing a CSV file.'
                : 'No groups matched your search or filters.'}
            </p>
            {groups.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                icon={<Plus size={14} />}
                onClick={() => handleOpenAdd()}
              >
                Add Your First Group
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Active</th>
                  <th className="py-3 px-4 font-semibold">Group Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Post Count</th>
                  <th className="py-3 px-4 font-semibold">Last Posted</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGroups.map(group => (
                  <tr key={group.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEnabled(group)}
                        title={group.enabled ? 'Click to disable' : 'Click to enable'}
                        className="text-slate-400 hover:text-white"
                      >
                        {group.enabled ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <XCircle size={16} className="text-slate-600" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white max-w-[220px] truncate" title={group.name}>
                        {group.name}
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-[220px] truncate" title={group.url}>
                        {group.url}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {group.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {group.location || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={group.status}>{group.status}</Badge>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {group.postCount || 0}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {group.lastPostedAt ? formatDate(group.lastPostedAt) : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenGroupUrl(group.url)}
                          title="Open in Facebook"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenAdd(group)}
                          title="Edit Group"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingGroupId(group.id)}
                          title="Delete Group"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Single Group Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingGroup ? 'Edit Facebook Group' : 'Add Facebook Group'}
        description="Provide a direct Facebook Group URL. The extension will automatically validate and extract the group identifier."
      >
        <form onSubmit={handleSaveSingleGroup} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dhaka Buy & Sell Marketplace"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Facebook Group URL *</label>
            <input
              type="url"
              required
              placeholder="https://www.facebook.com/groups/yourgroup/"
              value={formUrl}
              onChange={e => setFormUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Vehicles, Electronics"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Dhaka, Bangladesh"
                value={formLocation}
                onChange={e => setFormLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Posting Rules</label>
            <textarea
              rows={2}
              placeholder="e.g. Rule: Price must be in the title; 1 post per day max"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingGroup ? 'Save Changes' : 'Add Group'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Add Facebook Groups"
        description="Enter one Facebook Group URL per line. You can also specify Name, URL on each line."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Category for this batch</label>
            <input
              type="text"
              value={bulkCategory}
              onChange={e => setBulkCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Group URLs (One per line)
            </label>
            <textarea
              rows={8}
              placeholder={`https://www.facebook.com/groups/dhaka.bikes\nhttps://www.facebook.com/groups/chattogram.buysell\nChattogram Gadgets, https://www.facebook.com/groups/ctg.gadgets`}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveBulk}>
              Process & Import Batch
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Preview Modal */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="CSV Import Summary & Preview"
        description="Review rows parsed from your CSV before applying to your database."
        maxWidth="2xl"
      >
        {csvSummary && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <div className="text-xl font-bold text-emerald-400">{csvSummary.validRows.length}</div>
                <div className="text-[11px] text-emerald-300 font-semibold">Valid Rows</div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <div className="text-xl font-bold text-amber-400">{csvSummary.duplicateRows.length}</div>
                <div className="text-[11px] text-amber-300 font-semibold">Duplicates</div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <div className="text-xl font-bold text-red-400">{csvSummary.invalidRows.length}</div>
                <div className="text-[11px] text-red-300 font-semibold">Invalid Rows</div>
              </div>
            </div>

            {/* Duplicates option */}
            {csvSummary.duplicateRows.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  id="skipDupes"
                  checked={csvSkipDuplicates}
                  onChange={e => setCsvSkipDuplicates(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="skipDupes" className="text-slate-300 cursor-pointer">
                  Skip {csvSummary.duplicateRows.length} duplicate groups (Recommended)
                </label>
              </div>
            )}

            {/* Preview table */}
            <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">URL</th>
                    <th className="p-2">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {csvSummary.validRows.slice(0, 10).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 text-white">{r.name}</td>
                      <td className="p-2 text-slate-400 truncate max-w-[200px]">{r.url}</td>
                      <td className="p-2 text-slate-300">{r.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsCsvModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCsvImport}
                disabled={csvSummary.validRows.length === 0}
              >
                Import {csvSummary.validRows.length} Groups
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingGroupId !== null}
        onClose={() => setDeletingGroupId(null)}
        onConfirm={async () => {
          if (deletingGroupId) {
            await onDeleteGroup(deletingGroupId);
            toast.info('Group deleted');
            setDeletingGroupId(null);
          }
        }}
        title="Delete Group"
        message="Are you sure you want to delete this Facebook group? Any pending queue items for this group will remain until cleared."
        confirmLabel="Delete"
      />
    </div>
  );
};
