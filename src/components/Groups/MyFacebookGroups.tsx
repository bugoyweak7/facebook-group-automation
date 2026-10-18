import React, { useState, useMemo, useEffect } from 'react';
import { Group, GroupPrivacy, DiscoveryProgress, DiscoveryState, FacebookAccountInfo } from '../../types/group';
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
  CheckSquare,
  Square,
  Compass,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { validateFacebookGroupUrl, detectDuplicateGroup } from '../../utils/validators';
import { generateId, formatDate, downloadFile } from '../../utils/helpers';
import { parseGroupsCsv, exportGroupsToCsv, CsvImportSummary } from '../../services/csv/csv-parser';
import { getDiscoveryProgress, setDiscoveryProgress } from '../../services/facebook/discovery-manager';
import { getFacebookAccount } from '../../services/storage/chrome-storage';
import { useToast } from '../common/Toast';
import { SelectGroupsModal } from './SelectGroupsModal';
import { Check, Users } from 'lucide-react';

interface MyFacebookGroupsProps {
  groups: Group[];
  onSaveGroup: (group: Group) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onImportGroups: (groups: Group[]) => Promise<void>;
  onOpenGroupUrl: (url: string) => void;
  onProceedToPost: (selectedGroupIds: string[]) => void;
}

export const MyFacebookGroups: React.FC<MyFacebookGroupsProps> = ({
  groups,
  onSaveGroup,
  onDeleteGroup,
  onImportGroups,
  onOpenGroupUrl,
  onProceedToPost,
}) => {
  const toast = useToast();

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [privacyFilter, setPrivacyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [account, setAccount] = useState<FacebookAccountInfo | null>(null);

  // Discovery State
  const [discoveryProgress, setDiscoveryState] = useState<DiscoveryProgress>({
    state: 'NOT_CONNECTED',
    foundCount: 0,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
    message: 'Click "Discover My Facebook Groups" to scan your joined groups.',
  });
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // Single Group Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPrivacy, setFormPrivacy] = useState<GroupPrivacy>('PUBLIC');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import state
  const [csvFileContent, setCsvFileContent] = useState<string>('');
  const [csvSummary, setCsvSummary] = useState<CsvImportSummary | null>(null);
  const [csvSkipDuplicates, setCsvSkipDuplicates] = useState(true);

  // Load discovery progress & account
  useEffect(() => {
    getFacebookAccount().then(setAccount);
    getDiscoveryProgress().then(prog => {
      setDiscoveryState(prog);
      if (prog.state === 'DISCOVERING') {
        setIsDiscovering(true);
      }
    });

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = () => {
        getDiscoveryProgress().then(prog => {
          setDiscoveryState(prog);
          setIsDiscovering(prog.state === 'DISCOVERING');
        });
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  // Trigger Facebook Group Discovery
  const handleDiscoverGroups = () => {
    setIsDiscovering(true);
    setDiscoveryState(prev => ({
      ...prev,
      state: 'DISCOVERING',
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      message: 'Connecting to Facebook tab and discovering groups...',
    }));

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'START_GROUP_DISCOVERY' }, response => {
        if (chrome.runtime.lastError) {
          toast.error('Discovery error: ' + chrome.runtime.lastError.message);
          setIsDiscovering(false);
        } else if (response && !response.success) {
          toast.warning(response.error || 'Could not discover groups. Ensure Facebook is open & logged in.');
          setIsDiscovering(false);
        }
      });
    } else {
      // Mock for browser dev environment
      setTimeout(() => {
        setIsDiscovering(false);
        toast.info('Browser environment: simulated discovery');
      }, 1500);
    }
  };

  // Selection Logic
  const selectedGroups = useMemo(() => groups.filter(g => g.selected), [groups]);
  const selectedCount = selectedGroups.length;
  const isAllSelected = groups.length > 0 && selectedCount === groups.length;

  const handleToggleSelectGroup = async (group: Group) => {
    await onSaveGroup({
      ...group,
      selected: !group.selected,
      updatedAt: Date.now(),
    });
  };

  const handleSelectAll = async () => {
    for (const group of groups) {
      if (!group.selected) {
        await onSaveGroup({ ...group, selected: true, updatedAt: Date.now() });
      }
    }
    toast.success(`Selected all ${groups.length} groups`);
  };

  const handleUnselectAll = async () => {
    for (const group of groups) {
      if (group.selected) {
        await onSaveGroup({ ...group, selected: false, updatedAt: Date.now() });
      }
    }
    toast.info('Unselected all groups');
  };

  // Categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    groups.forEach(g => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set);
  }, [groups]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch =
        searchTerm === '' ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.groupId && g.groupId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.category && g.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
      const matchesPrivacy = privacyFilter === 'ALL' || g.privacy === privacyFilter;
      const matchesCategory = categoryFilter === 'ALL' || g.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPrivacy && matchesCategory;
    });
  }, [groups, searchTerm, statusFilter, privacyFilter, categoryFilter]);

  // Form handling
  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormCategory('General');
    setFormPrivacy('PUBLIC');
    setFormNotes('');
    setFormError(null);
    setEditingGroup(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (group: Group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormUrl(group.url);
    setFormCategory(group.category || 'General');
    setFormPrivacy(group.privacy || 'PUBLIC');
    setFormNotes(group.notes || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveSingleGroup = async () => {
    const validation = validateFacebookGroupUrl(formUrl);
    if (!validation.valid) {
      setFormError(validation.errors?.join(', ') || 'Invalid Facebook Group URL');
      return;
    }

    if (detectDuplicateGroup(formUrl, groups, editingGroup?.id)) {
      setFormError('This group already exists in your list');
      return;
    }

    const now = Date.now();
    const groupToSave: Group = {
      id: editingGroup ? editingGroup.id : generateId('grp'),
      name: formName.trim() || validation.groupId || 'Facebook Group',
      url: validation.cleanUrl || formUrl,
      groupId: validation.groupId,
      privacy: formPrivacy,
      category: formCategory.trim() || 'General',
      notes: formNotes.trim() || undefined,
      enabled: editingGroup ? editingGroup.enabled : true,
      selected: editingGroup ? editingGroup.selected : true,
      status: editingGroup ? editingGroup.status : 'READY',
      postCount: editingGroup ? editingGroup.postCount : 0,
      lastPostedAt: editingGroup ? editingGroup.lastPostedAt : undefined,
      discoveredAt: editingGroup?.discoveredAt || now,
      createdAt: editingGroup ? editingGroup.createdAt : now,
      updatedAt: now,
    };

    try {
      await onSaveGroup(groupToSave);
      toast.success(editingGroup ? 'Group updated successfully' : 'Group added successfully');
      setIsAddModalOpen(false);
      resetForm();
    } catch {
      setFormError('Failed to save group to local storage.');
    }
  };

  // CSV Import / Export
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setCsvFileContent(content);
      const summary = parseGroupsCsv(content, groups);
      setCsvSummary(summary);
    };
    reader.readAsText(file);
  };

  const handleApplyCsvImport = async () => {
    if (!csvSummary) return;
    const rowsToImport = csvSummary.validRows;
    if (rowsToImport.length === 0) {
      toast.error('No valid groups found to import.');
      return;
    }
    const now = Date.now();
    const newGroups: Group[] = rowsToImport.map(row => {
      const check = validateFacebookGroupUrl(row.url);
      return {
        id: generateId('grp'),
        name: row.name,
        url: check.cleanUrl || row.url,
        groupId: check.groupId,
        privacy: 'PUBLIC',
        category: row.category || 'General',
        location: row.location,
        notes: row.notes,
        enabled: true,
        selected: true,
        status: 'READY',
        postCount: 0,
        createdAt: now,
        updatedAt: now,
      };
    });

    await onImportGroups(newGroups);
    toast.success(`Successfully imported ${newGroups.length} groups!`);
    setIsCsvModalOpen(false);
    setCsvFileContent('');
    setCsvSummary(null);
  };

  const handleExportCsv = () => {
    if (groups.length === 0) {
      toast.info('No groups to export.');
      return;
    }
    const csvData = exportGroupsToCsv(groups);
    downloadFile(csvData, `facebook_groups_${Date.now()}.csv`, 'text/csv');
    toast.success('Groups exported as CSV.');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Group Discovery Control */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white tracking-tight">My Facebook Groups</h2>
              {account?.name ? (
                <Badge variant="success" size="sm">Connected: {account.name}</Badge>
              ) : (
                <Badge variant="info" size="sm">Logged-In Account</Badge>
              )}
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              Discover and manage groups available to your currently logged-in Facebook account in this browser.
              No manual URL pasting required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<Users size={18} />}
              onClick={() => setIsSelectModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 font-bold px-5"
            >
              Select & Sync Groups
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Compass size={16} className={isDiscovering ? 'animate-spin' : ''} />}
              isLoading={isDiscovering}
              onClick={handleDiscoverGroups}
            >
              {isDiscovering ? 'Syncing...' : 'Quick Sync'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Upload size={16} />}
              onClick={() => setIsCsvModalOpen(true)}
            >
              Import CSV
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Download size={16} />}
              onClick={handleExportCsv}
              disabled={groups.length === 0}
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={<Plus size={16} />}
              onClick={handleOpenAddModal}
            >
              Add Group
            </Button>
          </div>
        </div>

        {/* Discovery Progress / Status Banner (Requirements 14 & 15) */}
        {discoveryProgress.state === 'DISCOVERING' && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                <RefreshCw size={15} className="animate-spin text-indigo-400" />
                Scanning Facebook Groups... {discoveryProgress.foundCount} verified groups discovered
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Verified: {discoveryProgress.foundCount} | Duplicates: {discoveryProgress.duplicateCount}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {discoveryProgress.state === 'DISCOVERY_COMPLETE' && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-200">
                    {groups.length} verified groups found — scan complete.
                  </h4>
                  <p className="text-xs text-slate-300">
                    Target count verified and canonical deduplication passed.
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-300 font-mono font-bold">
                {groups.length} Verified
              </span>
            </div>
            {discoveryProgress.debugMetrics && (
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-emerald-900/50 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>Candidates: <strong className="text-slate-200">{discoveryProgress.debugMetrics.candidateCount}</strong></div>
                <div>Duplicates: <strong className="text-amber-300">{discoveryProgress.debugMetrics.duplicatesRemoved}</strong></div>
                <div>Rejected: <strong className="text-rose-300">{discoveryProgress.debugMetrics.rejectedCount}</strong></div>
                <div>Reason: <strong className="text-emerald-300">{discoveryProgress.debugMetrics.completionReason}</strong></div>
              </div>
            )}
          </div>
        )}

        {discoveryProgress.state === 'DISCOVERY_PARTIAL' && (
          <div className="mt-5 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-200">
                    {groups.length} verified groups found — Facebook did not expose the complete list.
                  </h4>
                  <p className="text-xs text-slate-300">
                    Scan stopped due to stagnation or UI limits before the target was confirmed.
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-300 font-mono font-bold">
                PARTIAL ({discoveryProgress.completionReason || 'STAGNANT_TIMEOUT'})
              </span>
            </div>
            {discoveryProgress.debugMetrics && (
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-amber-900/50 grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>Candidates: <strong className="text-slate-200">{discoveryProgress.debugMetrics.candidateCount}</strong></div>
                <div>Duplicates: <strong className="text-amber-300">{discoveryProgress.debugMetrics.duplicatesRemoved}</strong></div>
                <div>Rejected: <strong className="text-rose-300">{discoveryProgress.debugMetrics.rejectedCount}</strong></div>
                <div>Reason: <strong className="text-amber-300">{discoveryProgress.debugMetrics.completionReason}</strong></div>
              </div>
            )}
          </div>
        )}

        {discoveryProgress.state === 'DISCOVERY_FAILED' && (
          <div className="mt-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-rose-200">Facebook group discovery failed.</h4>
                <p className="text-xs text-slate-300">
                  {discoveryProgress.message || 'Make sure Facebook is open in a tab and signed in.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {(discoveryProgress.state === 'NOT_CONNECTED' || discoveryProgress.state === 'FACEBOOK_NOT_OPEN') && groups.length === 0 && (
          <div className="mt-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-amber-400" />
              <span>
                Open Facebook in a Chrome tab and click <strong>Discover My Facebook Groups</strong> to sync.
              </span>
            </div>
            <a
              href="https://www.facebook.com/groups/joins/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Open Facebook Groups
            </a>
          </div>
        )}
      </Card>

      {/* Group Search, Filter, and Selection Controls */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search groups by name, URL, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="POSTED">Posted</option>
              <option value="SKIPPED">Skipped</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Privacy Filter */}
            <select
              value={privacyFilter}
              onChange={e => setPrivacyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Privacy</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>

            {/* Category Filter */}
            {categories.length > 1 && (
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Select/Unselect All */}
            <Button
              variant="outline"
              size="sm"
              icon={isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              onClick={isAllSelected ? handleUnselectAll : handleSelectAll}
              disabled={groups.length === 0}
            >
              {isAllSelected ? 'Unselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        {/* Selected Summary Bar */}
        <div className="flex items-center justify-between px-2 pt-2 text-xs border-t border-slate-800 text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredGroups.length}</strong> of <strong className="text-white">{groups.length}</strong> groups
            {selectedCount > 0 && (
              <span className="ml-2 text-indigo-400 font-semibold">
                ({selectedCount} selected for posting)
              </span>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight size={14} />}
                onClick={() => onProceedToPost(selectedGroups.map(g => g.id))}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Create Posting Queue ({selectedCount})
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Groups Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-md">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 select-none">
              <th className="p-3.5 w-12 text-center">
                <button
                  type="button"
                  onClick={isAllSelected ? handleUnselectAll : handleSelectAll}
                  className="text-slate-400 hover:text-white"
                  title={isAllSelected ? 'Unselect All' : 'Select All'}
                >
                  {isAllSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                </button>
              </th>
              <th className="p-3.5">Group Name</th>
              <th className="p-3.5">Group URL & Slug</th>
              <th className="p-3.5">Privacy</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Last Used</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400">
                  <div className="max-w-md mx-auto space-y-3">
                    <Compass size={36} className="mx-auto text-slate-600 animate-pulse" />
                    <h3 className="text-base font-semibold text-white">No Facebook groups found yet.</h3>
                    <p className="text-xs text-slate-400">
                      {groups.length === 0
                        ? 'Open Facebook in a Chrome tab and click Sync to discover your joined groups.'
                        : 'No groups match your search and filter criteria.'}
                    </p>
                    {groups.length === 0 && (
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          size="md"
                          icon={<Compass size={16} />}
                          onClick={handleDiscoverGroups}
                        >
                          Discover My Facebook Groups
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredGroups.map(group => {
                const isSelected = Boolean(group.selected);
                return (
                  <tr
                    key={group.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectGroup(group)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-indigo-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    {/* Group Name & Real Photo */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        {group.imageUrl ? (
                          <img
                            src={group.imageUrl}
                            alt={group.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 flex-shrink-0 bg-slate-800"
                            onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-700 to-blue-600 border border-indigo-500/30 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                            {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                          </div>
                        )}
                        <div className="truncate max-w-xs">
                          <div className="font-semibold text-white truncate" title={group.name}>
                            {group.name}
                          </div>
                          {group.location && (
                            <span className="text-[11px] text-slate-400">{group.location}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Group URL / Slug */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 truncate hover:underline flex items-center gap-1"
                        >
                          <span>{group.groupId || group.url.replace(/^https?:\/\/(www\.)?facebook\.com\/groups\//, '')}</span>
                          <ExternalLink size={11} className="flex-shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Privacy */}
                    <td className="p-3.5">
                      {group.privacy === 'PUBLIC' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Globe size={11} />
                          Public
                        </span>
                      ) : group.privacy === 'PRIVATE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Lock size={11} />
                          Private
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <Badge variant="default" size="sm">{group.category || 'General'}</Badge>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {group.status === 'POSTED' && <Badge variant="success" size="sm">Posted</Badge>}
                      {group.status === 'READY' && <Badge variant="info" size="sm">Ready</Badge>}
                      {group.status === 'SKIPPED' && <Badge variant="warning" size="sm">Skipped</Badge>}
                      {group.status === 'FAILED' && <Badge variant="danger" size="sm">Failed</Badge>}
                      {group.status === 'IN_PROGRESS' && <Badge variant="purple" size="sm">In Progress</Badge>}
                      {group.status === 'PENDING' && <Badge variant="default" size="sm">Pending</Badge>}
                    </td>

                    {/* Last Used */}
                    <td className="p-3.5 text-xs text-slate-400">
                      {group.lastPostedAt ? formatDate(group.lastPostedAt) : 'Never'}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenGroupUrl(group.url)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                          title="Open in Tab"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(group)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Edit Group"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingGroupId(group.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Group"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bottom Selection Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl flex items-center gap-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400 text-xs">
              {selectedCount}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {selectedCount} {selectedCount === 1 ? 'Group' : 'Groups'} Selected
              </div>
              <div className="text-[11px] text-slate-400">Ready to queue for sequential posting</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnselectAll}
            >
              Clear Selection
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => onProceedToPost(selectedGroups.map(g => g.id))}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Create Posting Queue
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Group */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingGroup ? 'Edit Facebook Group' : 'Add Facebook Group'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Group Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g., Rangamati Buy Sell"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Facebook Group URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formUrl}
              onChange={e => setFormUrl(e.target.value)}
              placeholder="https://www.facebook.com/groups/yourgroupname"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                placeholder="e.g., Buy & Sell"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Privacy</label>
              <select
                value={formPrivacy}
                onChange={e => setFormPrivacy(e.target.value as GroupPrivacy)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="PUBLIC">Public Group</option>
                <option value="PRIVATE">Private Group</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="e.g., Rules: Bike sales only, admin approval required..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveSingleGroup}>
              {editingGroup ? 'Update Group' : 'Save Group'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: CSV Import */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Import Groups via CSV"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Upload a CSV file containing columns: <code>name</code>, <code>url</code>, and optionally <code>category</code>, <code>privacy</code>.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleCsvFileUpload}
            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />

          {csvSummary && (
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-white">CSV Analysis:</div>
              <div className="text-slate-300">Total rows: {csvSummary.totalRows}</div>
              <div className="text-emerald-400">Valid groups: {csvSummary.validRows.length}</div>
              <div className="text-amber-400">Duplicates: {csvSummary.duplicateRows.length}</div>
              <div className="text-rose-400">Invalid rows: {csvSummary.invalidRows.length}</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="skipDuplicates"
              checked={csvSkipDuplicates}
              onChange={e => setCsvSkipDuplicates(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600"
            />
            <label htmlFor="skipDuplicates" className="text-xs text-slate-300">
              Skip duplicate URLs
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="md" onClick={() => setIsCsvModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!csvSummary || csvSummary.validRows.length === 0}
              onClick={handleApplyCsvImport}
            >
              Import {csvSummary?.validRows.length || 0} Groups
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingGroupId)}
        onClose={() => setDeletingGroupId(null)}
        onConfirm={async () => {
          if (deletingGroupId) {
            await onDeleteGroup(deletingGroupId);
            setDeletingGroupId(null);
            toast.info('Group deleted.');
          }
        }}
        title="Delete Facebook Group"
        message="Are you sure you want to remove this group from your saved list? Existing queue items for this group will remain."
        confirmLabel="Delete Group"
        isDestructive={true}
      />

      {/* Select Groups Modal */}
      <SelectGroupsModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        groups={groups}
        selectedGroupIds={selectedGroups.map(g => g.id)}
        onConfirm={async (selected) => {
          const ids = selected.map(g => g.id);
          for (const g of groups) {
            const isNowSelected = ids.includes(g.id);
            if (g.selected !== isNowSelected) {
              await onSaveGroup({ ...g, selected: isNowSelected, updatedAt: Date.now() });
            }
          }
          toast.success(`Updated selection for ${ids.length} groups!`);
        }}
        onSaveGroups={onImportGroups}
        onOpenGroupUrl={onOpenGroupUrl}
      />
    </div>
  );
};
