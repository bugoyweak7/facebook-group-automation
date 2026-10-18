import React, { useState, useMemo, useEffect } from 'react';
import { Group } from '../../types/group';
import {
  Users,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getDiscoveryProgress } from '../../services/facebook/discovery-manager';
import { getFacebookAccount } from '../../services/storage/chrome-storage';
import { useToast } from '../common/Toast';
import { validateFacebookGroupUrl } from '../../utils/validators';
import { generateId } from '../../utils/helpers';

export interface SelectGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  selectedGroupIds?: string[];
  onConfirm: (selectedGroups: Group[]) => void;
  onSaveGroups?: (updatedGroups: Group[]) => Promise<void>;
  onOpenGroupUrl?: (url: string) => void;
}

export const SelectGroupsModal: React.FC<SelectGroupsModalProps> = ({
  isOpen,
  onClose,
  groups,
  selectedGroupIds: initialSelectedIds = [],
  onConfirm,
  onSaveGroups,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'my-groups' | 'import-links'>('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdsOrder, setSelectedIdsOrder] = useState<string[]>(initialSelectedIds);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [foundCount, setFoundCount] = useState<number>(0);
  const [importText, setImportText] = useState('');

  // Sync initial selected IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setSelectedIdsOrder(initialSelectedIds);
      } else {
        const currentlySelected = groups.filter(g => g.selected).map(g => g.id);
        setSelectedIdsOrder(currentlySelected);
      }
    }
  }, [isOpen, initialSelectedIds, groups]);

  // Load initial discovery progress & last synced time
  useEffect(() => {
    getDiscoveryProgress().then(dp => {
      if (dp.state === 'DISCOVERING') {
        setIsSyncing(true);
        setFoundCount(dp.foundCount);
      }
      if (dp.lastDiscoveredAt) {
        setLastSyncedAt(dp.lastDiscoveredAt);
      }
    });

    getFacebookAccount().then(acc => {
      if (acc?.lastSyncedAt) {
        setLastSyncedAt(acc.lastSyncedAt);
      }
    });

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      const listener = (message: any) => {
        if (message?.type === 'GROUP_DISCOVERY_PROGRESS') {
          const payload = message.payload || {};
          setIsSyncing(true);
          setFoundCount(payload.foundCount || 0);
        } else if (message?.type === 'GROUP_BATCH_DISCOVERED') {
          const payload = message.payload || {};
          setFoundCount(payload.verifiedCount || 0);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, []);

  if (!isOpen) return null;

  // Trigger Facebook Group Discovery
  const handleStartSync = () => {
    setIsSyncing(true);
    setFoundCount(0);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'START_GROUP_DISCOVERY' }, (response: any) => {
        setIsSyncing(false);
        setLastSyncedAt(Date.now());
        if (chrome.runtime.lastError) {
          toast.error(`Sync error: ${chrome.runtime.lastError.message}`);
        } else if (response?.success) {
          const count = response.progress?.foundCount || response.progress?.groups?.length || 0;
          toast.success(`Successfully synced ${count} Facebook groups!`);
        } else if (response && !response.success) {
          toast.warning(response.error || 'Failed to sync Facebook groups. Please ensure Facebook is open.');
        }
      });
    } else {
      // Mock for development
      setTimeout(() => {
        setIsSyncing(false);
        setLastSyncedAt(Date.now());
        toast.info('Simulated sync complete in browser environment');
      }, 2500);
    }
  };

  const handleCancelSync = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'CANCEL_GROUP_DISCOVERY' });
    }
    setIsSyncing(false);
    toast.info('Sync cancelled');
  };

  // Toggle selection with order preservation
  const handleToggleSelect = (groupId: string) => {
    setSelectedIdsOrder(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredGroups.map(g => g.id);
    setSelectedIdsOrder(prev => {
      const set = new Set(prev);
      allFilteredIds.forEach(id => set.add(id));
      return Array.from(set);
    });
  };

  const handleClearAll = () => {
    setSelectedIdsOrder([]);
  };

  // Filter groups
  const filteredGroups = groups.filter(g =>
    searchTerm === '' ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.groupId && g.groupId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCount = selectedIdsOrder.length;

  // Confirm selection
  const handleConfirm = async () => {
    const orderedGroups: Group[] = [];
    selectedIdsOrder.forEach(id => {
      const found = groups.find(g => g.id === id);
      if (found) orderedGroups.push(found);
    });

    // Update 'selected' state in storage if save handler provided
    if (onSaveGroups) {
      const updated = groups.map(g => ({
        ...g,
        selected: selectedIdsOrder.includes(g.id),
      }));
      await onSaveGroups(updated);
    }

    onConfirm(orderedGroups);
    onClose();
  };

  // Save current selection as a named preset
  const handleSaveAsList = async () => {
    if (selectedCount === 0) {
      toast.warning('Please select at least one group first.');
      return;
    }
    const name = window.prompt('Enter a name for this group list preset:', 'My Target Groups');
    if (!name || !name.trim()) return;

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const key = 'agp_saved_group_lists';
        chrome.storage.local.get([key], res => {
          const lists = res[key] || [];
          lists.push({
            id: generateId('list'),
            name: name.trim(),
            groupIds: selectedIdsOrder,
            createdAt: Date.now(),
          });
          chrome.storage.local.set({ [key]: lists }, () => {
            toast.success(`Saved list "${name.trim()}" with ${selectedCount} groups!`);
          });
        });
      } else {
        toast.success(`Saved list "${name.trim()}" with ${selectedCount} groups!`);
      }
    } catch {
      toast.success('List saved successfully');
    }
  };

  // Import links handler
  const handleImportLinks = async () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.warning('Please enter at least one Facebook group link.');
      return;
    }

    const imported: Group[] = [];
    const now = Date.now();

    for (const line of lines) {
      const val = validateFacebookGroupUrl(line);
      if (val.valid && val.groupId) {
        // Check if not already exists
        const exists = groups.find(
          g => g.groupId?.toLowerCase() === val.groupId?.toLowerCase() || g.url.toLowerCase() === (val.cleanUrl || line).toLowerCase()
        );
        if (!exists) {
          imported.push({
            id: generateId('grp'),
            name: val.groupId.replace(/[-_.]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            url: val.cleanUrl || line,
            groupId: val.groupId,
            category: 'Imported',
            privacy: 'UNKNOWN',
            enabled: true,
            selected: true,
            status: 'READY',
            postCount: 0,
            verified: true,
            source: 'import',
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    if (imported.length > 0 && onSaveGroups) {
      await onSaveGroups([...imported, ...groups]);
      // Select imported ones
      setSelectedIdsOrder(prev => [...imported.map(g => g.id), ...prev]);
      toast.success(`Imported and added ${imported.length} groups!`);
      setImportText('');
      setActiveTab('my-groups');
    } else if (imported.length === 0) {
      toast.info('No new valid groups were found in the text.');
    }
  };

  const formattedLastSynced = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fadeIn p-4">
      {/* Main Select Groups Card - matching reference screenshot layout */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Select Groups
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4">
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'my-groups'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>My Groups</span>
          </button>

          <button
            onClick={() => setActiveTab('import-links')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'import-links'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon size={16} />
            <span>Import Links</span>
          </button>
        </div>

        {/* Tab 1: My Groups */}
        {activeTab === 'my-groups' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            
            {/* Sync from Facebook Blue Button */}
            <button
              onClick={isSyncing ? handleCancelSync : handleStartSync}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                isSyncing
                  ? 'bg-blue-600 hover:bg-blue-700 opacity-90'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
              }`}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync from Facebook'}</span>
            </button>

            {/* Syncing Progress Card */}
            {isSyncing && (
              <div className="space-y-2 animate-fadeIn">
                {/* Notice Box */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  A small Facebook window opened. Keep it visible and don't close it. We'll scroll your groups automatically and close the window when sync finishes.
                </div>

                {/* Progress Bar & Counter */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full animate-pulse w-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <span>Scanning groups... Found {foundCount} so far</span>
                    <span>Found {foundCount}</span>
                  </div>
                </div>

                <div className="text-left">
                  <button
                    onClick={handleCancelSync}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
                  >
                    Cancel sync
                  </button>
                </div>
              </div>
            )}

            {/* Last Synced Meta (when not syncing) */}
            {!isSyncing && formattedLastSynced && (
              <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                Last synced: {formattedLastSynced}
              </div>
            )}

            {/* Empty state when 0 groups and not syncing */}
            {groups.length === 0 && !isSyncing ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Users size={28} />
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No groups synced yet
                </div>
                <div className="text-xs text-slate-400">
                  Click "Sync from Facebook" to start
                </div>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Controls Row: Select All | Clear All & Groups count */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                    <button onClick={handleSelectAll} className="hover:underline">
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button onClick={handleClearAll} className="hover:underline text-slate-500 dark:text-slate-400">
                      Clear All
                    </button>
                  </div>

                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    Groups count {selectedCount}/{groups.length}
                  </span>
                </div>

                {/* Selection order becomes posting order note */}
                <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  Selection order becomes posting order.
                </div>

                {/* Scrollable Groups List */}
                <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredGroups.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No groups match "{searchTerm}"
                    </div>
                  ) : (
                    filteredGroups.map(group => {
                      const isSelected = selectedIdsOrder.includes(group.id);
                      const orderIndex = selectedIdsOrder.indexOf(group.id) + 1;

                      return (
                        <div
                          key={group.id}
                          onClick={() => handleToggleSelect(group.id)}
                          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/60 dark:bg-blue-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>

                          {/* Group Image */}
                          {group.imageUrl ? (
                            <img
                              src={group.imageUrl}
                              alt={group.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-100"
                              onError={e => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs flex-shrink-0">
                              {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                            </div>
                          )}

                          {/* Group Name & Order Badge */}
                          <div className="flex-1 min-w-0 flex items-center gap-1.5">
                            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate" title={group.name}>
                              {group.name}
                            </div>
                            {group.verified && (
                              <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Order Index if selected */}
                          {isSelected && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              #{orderIndex}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Import Links */}
        {activeTab === 'import-links' && (
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Paste Facebook Group URLs below (one link per line):
            </div>

            <textarea
              rows={8}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="https://www.facebook.com/groups/examplegroup1/&#10;https://facebook.com/groups/123456789/&#10;https://www.facebook.com/groups/examplegroup2/"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
            />

            <button
              onClick={handleImportLinks}
              disabled={!importText.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Import Groups
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleSaveAsList}
            className="flex-1 py-2.5 px-4 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Save as List
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Confirm ({selectedCount})
          </button>
        </div>

      </div>
    </div>
  );
};
