import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Group, DiscoveryProgress, FacebookAccountInfo } from '../../types/group';
import { Post } from '../../types/post';
import { QueueItem, QueueState } from '../../types/queue';
import {
  getGroups,
  setGroups,
  saveGroup,
  deleteGroup,
  isInvalidNotificationGroup,
  getPosts,
  savePost,
  getQueue,
  getQueueState,
  setQueueState as persistQueueState,
  getSettings,
  updateSettings,
  getFacebookAccount,
} from '../../services/storage/chrome-storage';
import {
  createQueueItems,
  updateItemStatus,
  recordItemPosted,
  recordItemSkipped,
  findNextExecutableItem,
} from '../../services/queue/queue-engine';

import { getDiscoveryProgress } from '../../services/facebook/discovery-manager';
import {
  Play,
  Pause,
  ExternalLink,
  CheckCircle2,
  SkipForward,
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  RefreshCw,
  Search,
  Check,
  RotateCcw,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  StopCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { validateFacebookGroupUrl } from '../../utils/validators';
import { generateId } from '../../utils/helpers';
import { aiService } from '../../services/ai/ai-service';
import {
  applyTextStyle,
  applyBulletList,
  autoBeautifyCaption,
  htmlToStyledText,
  deduplicateRepeatedCaption,
  FontStyleType,
} from '../../utils/text-styler';

export const PopupApp: React.FC = () => {
  // Navigation views: 'select-groups' | 'compose' | 'posting-queue'
  const [view, setView] = useState<'select-groups' | 'compose' | 'posting-queue'>('select-groups');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'import-links'>('my-groups');
  const [account, setAccount] = useState<FacebookAccountInfo | null>(null);
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({
    isRunning: false,
    isPaused: false,
    currentItemId: null,
  });
  const [discoveryProgress, setDiscoveryProgress] = useState<DiscoveryProgress>({
    state: 'NOT_CONNECTED',
    foundCount: 0,
    importedCount: 0,
    duplicateCount: 0,
    errorCount: 0,
  });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdsOrder, setSelectedIdsOrder] = useState<string[]>([]);
  const [importText, setImportText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Composer State
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [delaySec, setDelaySec] = useState<number>(0);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isPolishingAi, setIsPolishingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApplyStyle = (style: FontStyleType) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const styled = applyTextStyle(selected, style);
      const nextCaption = caption.substring(0, start) + styled + caption.substring(end);
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + styled.length);
      }, 0);
    } else {
      if (!caption.trim()) {
        showToast('Write text to style');
        return;
      }
      setCaption(applyTextStyle(caption, style));
      showToast(`Applied ${style}!`);
    }
  };

  const handleApplyBullets = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const bulleted = applyBulletList(selected);
      const nextCaption = caption.substring(0, start) + bulleted + caption.substring(end);
      setCaption(nextCaption);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      const nextCaption = before + (before.endsWith('\n') || !before ? '  • ' : '\n  • ') + after;
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        const newPos = start + (before.endsWith('\n') || !before ? 4 : 5);
        el.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleAutoBeautify = () => {
    if (!caption.trim()) {
      showToast('Enter caption first');
      return;
    }
    const beautified = autoBeautifyCaption(caption);
    setCaption(beautified);
    showToast('✨ Caption Auto-Designed!');
  };

  const handlePasteCaption = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');

    if (
      htmlData &&
      (htmlData.includes('<i>') ||
        htmlData.includes('<em>') ||
        htmlData.includes('<b>') ||
        htmlData.includes('<strong>') ||
        htmlData.includes('<li>') ||
        htmlData.includes('font-style'))
    ) {
      let styled = htmlToStyledText(htmlData);
      styled = deduplicateRepeatedCaption(styled);
      if (styled && styled.length > 0) {
        e.preventDefault();
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        let next = caption.substring(0, start) + styled + caption.substring(end);
        next = deduplicateRepeatedCaption(next);
        setCaption(next);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + styled.length, start + styled.length);
        }, 0);
        showToast('Pasted with design preserved!');
      }
    } else if (plainText) {
      const deduplicatedPlain = deduplicateRepeatedCaption(plainText);
      if (deduplicatedPlain !== plainText) {
        e.preventDefault();
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        let next = caption.substring(0, start) + deduplicatedPlain + caption.substring(end);
        next = deduplicateRepeatedCaption(next);
        setCaption(next);
        showToast('Cleaned duplicate text from paste!');
      }
    }
  };

  // Load storage state
  const loadData = useCallback(async () => {
    const [acc, g, p, q, qs, dp] = await Promise.all([
      getFacebookAccount(),
      getGroups(),
      getPosts(),
      getQueue(),
      getQueueState(),
      getDiscoveryProgress(),
    ]);

    // Prune any invalid groups or personal user profiles
    const cleanedGroups = g.filter(item => {
      if (isInvalidNotificationGroup(item)) return false;
      const nm = (item.name || '').trim().toLowerCase();
      if (acc?.name && nm === acc.name.trim().toLowerCase()) return false;
      if (acc?.userId && (item.groupId === acc.userId || item.url.includes(acc.userId))) return false;
      return true;
    });

    if (cleanedGroups.length !== g.length) {
      setGroups(cleanedGroups);
    }

    const updatedAcc = acc ? { ...acc, totalGroupsCount: cleanedGroups.length } : acc;
    setAccount(updatedAcc);
    setGroupsState(cleanedGroups);
    setPosts(p);
    setQueue(q);
    setQueueState(qs);
    setDiscoveryProgress(dp);
    setIsDiscovering(dp.state === 'DISCOVERING');

    // Initialize selected IDs from stored selected state if empty
    setSelectedIdsOrder(prev => {
      if (prev.length === 0) {
        return cleanedGroups.filter(item => item.selected).map(item => item.id);
      }
      return prev.filter(id => cleanedGroups.some(item => item.id === id));
    });
  }, []);

  const handleDeleteGroup = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteGroup(id);
    setSelectedIdsOrder(prev => prev.filter(item => item !== id));
    await loadData();
    showToast('Removed from list');
  };


  useEffect(() => {
    loadData();

    let storageListener: (() => void) | null = null;
    let messageListener: ((msg: any) => void) | null = null;

    if (typeof chrome !== 'undefined') {
      if (chrome.storage?.onChanged) {
        storageListener = () => loadData();
        chrome.storage.onChanged.addListener(storageListener);
      }

      if (chrome.runtime?.onMessage) {
        messageListener = (message: any) => {
          if (message?.type === 'GROUP_DISCOVERY_PROGRESS') {
            const { foundCount, status } = message.payload || {};
            setIsDiscovering(true);
            setDiscoveryProgress(prev => ({
              ...prev,
              state: 'DISCOVERING',
              foundCount: foundCount || prev.foundCount,
              message: status || prev.message,
            }));
            loadData();
          } else if (message?.type === 'GROUP_BATCH_DISCOVERED') {
            const { verifiedCount } = message.payload || {};
            setDiscoveryProgress(prev => ({
              ...prev,
              foundCount: verifiedCount || prev.foundCount,
            }));
            loadData();
          }
        };
        chrome.runtime.onMessage.addListener(messageListener);
      }
    }

    // Fast initial scan on open if user is currently on a Facebook tab
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id && activeTab.url && activeTab.url.includes('facebook.com')) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'GET_FACEBOOK_USER_INFO' }, (res) => {
            if (!chrome.runtime.lastError && res?.groups && res.groups.length > 0) {
              loadData();
            }
          });
        }
      });
    }

    return () => {
      if (storageListener && chrome?.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
      if (messageListener && chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, [loadData]);

  // Sync from Facebook action
  // Sync from Facebook action - Always runs in a dedicated small detached popup window!
  const handleTriggerFullSync = () => {
    setIsDiscovering(true);
    setDiscoveryProgress(prev => ({
      ...prev,
      state: 'DISCOVERING',
      foundCount: groups.length,
      message: 'Scanning Facebook groups in dedicated window...',
    }));

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'START_GROUP_DISCOVERY' }, (res: any) => {
        setIsDiscovering(false);
        loadData();
        if (res?.success) {
          showToast(`Synced ${res.progress?.foundCount || groups.length} groups!`);
        }
      });
    } else {
      setTimeout(() => {
        setIsDiscovering(false);
        showToast('Simulated discovery complete');
      }, 2000);
    }
  };

  const handleCancelSync = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'CANCEL_GROUP_DISCOVERY' });
    }
    setIsDiscovering(false);
    showToast('Sync cancelled');
  };

  const handleToggleGroup = async (group: Group) => {
    setSelectedIdsOrder(prev => {
      const next = prev.includes(group.id)
        ? prev.filter(id => id !== group.id)
        : [...prev, group.id];

      // Update storage
      saveGroup({ ...group, selected: next.includes(group.id), updatedAt: Date.now() });
      return next;
    });
  };

  const handleSelectAll = async () => {
    const allFilteredIds = filteredGroups.map(g => g.id);
    const updatedIds = Array.from(new Set([...selectedIdsOrder, ...allFilteredIds]));
    setSelectedIdsOrder(updatedIds);

    const updatedGroups = groups.map(g => ({
      ...g,
      selected: updatedIds.includes(g.id),
      updatedAt: Date.now(),
    }));
    await setGroups(updatedGroups);
    setGroupsState(updatedGroups);
  };

  const handleClearAll = async () => {
    setSelectedIdsOrder([]);
    const updatedGroups = groups.map(g => ({
      ...g,
      selected: false,
      updatedAt: Date.now(),
    }));
    await setGroups(updatedGroups);
    setGroupsState(updatedGroups);
  };

  const handleSaveAsList = async () => {
    if (selectedIdsOrder.length === 0) {
      showToast('Please select groups first');
      return;
    }
    const name = window.prompt('Enter name for this saved list:', 'My Target Groups');
    if (!name || !name.trim()) return;

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
          showToast(`Saved list "${name.trim()}"!`);
        });
      });
    } else {
      showToast(`Saved list "${name.trim()}"!`);
    }
  };

  // Navigates directly into the in-popup post composer!
  const handleConfirm = () => {
    if (selectedIdsOrder.length === 0) {
      showToast('Please select at least 1 group');
      return;
    }
    setView('compose');
  };

  const handleImportLinks = async () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      showToast('Enter at least 1 group URL');
      return;
    }

    const imported: Group[] = [];
    const now = Date.now();

    for (const line of lines) {
      const val = validateFacebookGroupUrl(line);
      if (val.valid && val.groupId) {
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

    if (imported.length > 0) {
      const updated = [...imported, ...groups];
      await setGroups(updated);
      setGroupsState(updated);
      setSelectedIdsOrder(prev => [...imported.map(g => g.id), ...prev]);
      setImportText('');
      setActiveTab('my-groups');
      showToast(`Imported ${imported.length} groups!`);
    } else {
      showToast('No new valid groups found');
    }
  };

  // Composer Media Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const raw = ev.target?.result as string;
          if (raw) {
            setImages(prev => [...prev, raw]);
            showToast(`🎬 Video added: ${file.name}`);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const raw = ev.target?.result as string;
          if (!raw) return;
          const img = new Image();
          img.onload = () => {
            const MAX_DIM = 1280;
            let w = img.width;
            let h = img.height;
            if (w > MAX_DIM || h > MAX_DIM) {
              if (w > h) {
                h = Math.round((h * MAX_DIM) / w);
                w = MAX_DIM;
              } else {
                w = Math.round((w * MAX_DIM) / h);
                h = MAX_DIM;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.82)]);
            } else {
              setImages(prev => [...prev, raw]);
            }
          };
          img.onerror = () => setImages(prev => [...prev, raw]);
          img.src = raw;
        };
        reader.readAsDataURL(file);
      }
    });
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setCaption(prev => prev + emoji);
  };

  const handleAiPolish = async () => {
    if (!caption.trim() && !title.trim()) {
      showToast('Enter some text first to polish');
      return;
    }
    setIsPolishingAi(true);
    try {
      const generated = await aiService.generateCaptions({
        productDetails: caption || title,
        style: 'Sales',
        language: 'Bangla',
        includeEmojis: true,
        includeHashtags: true,
      });
      if (generated && generated.length > 0) {
        setCaption(generated[0]);
        showToast('Caption polished with AI!');
      } else {
        showToast('Could not polish caption');
      }
    } catch {
      showToast('AI polish error');
    } finally {
      setIsPolishingAi(false);
    }
  };

  // Submit Post and Start Sequential Group-by-Group Posting
  const handleStartPosting = async () => {
    if (!caption.trim()) {
      showToast('Please enter a caption first');
      return;
    }
    if (selectedIdsOrder.length === 0) {
      showToast('Please select at least 1 group');
      return;
    }

    setIsSubmittingPost(true);
    const now = Date.now();
    const cleanCaption = deduplicateRepeatedCaption(caption.trim());
    const newPost: Post = {
      id: generateId('post'),
      title: title.trim() || 'Facebook Group Listing',
      productName: title.trim() || 'Facebook Group Listing',
      price: price.trim() || undefined,
      location: location.trim() || undefined,
      contactInfo: phone.trim() || undefined,
      caption: cleanCaption,
      description: cleanCaption,
      images,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // 1. Save post
      await savePost(newPost);

      // 2. Save delay setting
      if (typeof delaySec === 'number' && delaySec >= 0) {
        const curSettings = await getSettings();
        await updateSettings({
          queue: { ...curSettings.queue, delayBetweenItemsSec: delaySec },
        });
      }

      // 3. Delegate queue creation and sequential posting to background service worker
      // Runs in a dedicated small popup window without hijacking user tabs
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'CREATE_AND_START_QUEUE',
          payload: {
            groupIds: selectedIdsOrder,
            postId: newPost.id,
            delaySec,
          },
        });
      }

      setIsSubmittingPost(false);
      showToast(`Started auto-posting to ${selectedIdsOrder.length} groups!`);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.close) {
          window.close();
        }
      }, 300);
    } catch (err: unknown) {
      setIsSubmittingPost(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      showToast(`Error: ${errMsg}`);
    }
  };

  const processNextQueueItemDirectly = async (currentId: string, status: 'POSTED' | 'SKIPPED') => {
    try {
      if (status === 'POSTED') {
        await recordItemPosted(currentId);
      } else {
        await recordItemSkipped(currentId);
      }

      // Close previous tab if open
      if (queueState.activeTabId && typeof chrome !== 'undefined' && chrome.tabs) {
        try {
          await chrome.tabs.remove(queueState.activeTabId);
        } catch {}
      }

      // Check for next eligible item
      const q = await getQueue();
      const next = findNextExecutableItem(q);
      if (next) {
        const grps = await getGroups();
        const grp = grps.find(g => g.id === next.groupId);
        let nextTabId: number | null = null;
        if (grp && typeof chrome !== 'undefined' && chrome.windows) {
          await updateItemStatus(next.id, 'IN_PROGRESS');
          const win = await chrome.windows.create({
            url: grp.url,
            type: 'popup',
            width: 960,
            height: 720,
            top: 60,
            left: 60,
            focused: true,
          });
          nextTabId = win.tabs?.[0]?.id ?? null;
        }

        const nextState: QueueState = {
          ...queueState,
          isRunning: true,
          isPaused: false,
          currentItemId: next.id,
          activeTabId: nextTabId,
          expectedGroupId: grp ? grp.id : null,
          expectedGroupName: grp ? grp.name : null,
          expectedGroupUrl: grp ? grp.url : null,
        };
        await persistQueueState(nextState);
        setQueueState(nextState);
      } else {
        const finishedState: QueueState = {
          ...queueState,
          isRunning: false,
          currentItemId: null,
          activeTabId: null,
        };
        await persistQueueState(finishedState);
        setQueueState(finishedState);
      }
      await loadData();
    } catch (e) {
      console.warn('Direct queue transition error:', e);
    }
  };

  const handleMarkPosted = async (itemId?: string) => {
    const targetId = itemId || queueState.currentItemId;
    if (!targetId) return;

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'MARK_AS_POSTED', payload: { itemId: targetId } }, async (res) => {
        if (chrome.runtime.lastError || !res?.success) {
          await processNextQueueItemDirectly(targetId, 'POSTED');
        } else {
          setTimeout(loadData, 300);
        }
      });
    } else {
      await processNextQueueItemDirectly(targetId, 'POSTED');
    }
  };

  const handleSkipCurrent = async (itemId?: string) => {
    const targetId = itemId || queueState.currentItemId;
    if (!targetId) return;

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SKIP_CURRENT_ITEM', payload: { itemId: targetId } }, async (res) => {
        if (chrome.runtime.lastError || !res?.success) {
          await processNextQueueItemDirectly(targetId, 'SKIPPED');
        } else {
          setTimeout(loadData, 300);
        }
      });
    } else {
      await processNextQueueItemDirectly(targetId, 'SKIPPED');
    }
  };


  const openDashboard = (tab?: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const baseUrl = chrome.runtime.getURL('src/pages/dashboard/index.html');
      const url = tab ? `${baseUrl}#${tab}` : baseUrl;
      chrome.tabs.create({ url });
    } else {
      window.open('/src/pages/dashboard/index.html', '_blank');
    }
  };

  const openGroupTab = (url?: string) => {
    if (!url) return;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url, active: true });
    } else {
      window.open(url, '_blank');
    }
  };

  const sendMessage = (type: string, payload?: unknown) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type, payload }, () => {
        setTimeout(loadData, 200);
      });
    }
  };

  // Filtered groups
  const filteredGroups = groups.filter(g =>
    searchTerm === '' ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.groupId && g.groupId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCount = selectedIdsOrder.length;

  const activeItem = queueState.currentItemId
    ? queue.find(q => q.id === queueState.currentItemId)
    : queue.find(q => q.status === 'IN_PROGRESS' || q.status === 'WAITING_FOR_USER' || q.status === 'READY') || null;

  const activeGroup = activeItem
    ? groups.find(
        g => g.id === activeItem.groupId || g.groupId === activeItem.groupId || (g.url && activeItem.groupId && g.url.includes(activeItem.groupId))
      ) || {
        id: activeItem.groupId,
        name: activeItem.groupName || queueState.expectedGroupName || 'Facebook Group',
        url: activeItem.groupUrl || queueState.expectedGroupUrl || `https://www.facebook.com/groups/${activeItem.groupId}/`,
        privacy: 'PUBLIC' as const,
        memberCount: 0,
        postCount: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    : null;

  const activePost = activeItem ? posts.find(p => p.id === activeItem.postId) || posts[0] || null : null;
  const activeIndex = activeItem ? queue.findIndex(q => q.id === activeItem.id) + 1 : 0;
  const postedCount = queue.filter(q => q.status === 'POSTED').length;
  const progressPercent = queue.length > 0 ? Math.round((postedCount / queue.length) * 100) : 0;

  const lastSyncedFormatted = account?.lastSyncedAt || discoveryProgress.lastDiscoveredAt
    ? new Date(account?.lastSyncedAt || discoveryProgress.lastDiscoveredAt!).toLocaleString('en-US', {
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
    <div className="w-[390px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans select-none flex flex-col h-[580px] shadow-2xl relative overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-50 animate-fadeIn pointer-events-none whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: SELECT GROUPS VIEW (Matching Reference Screenshot) */}
      {/* ========================================================================= */}
      {view === 'select-groups' && (
        <>
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight" title="AI Group Poster">
                Select Groups
              </h1>
              <span className="sr-only">AI Group Poster</span>
            </div>

            <div className="flex items-center gap-2">
              {queueState.isRunning && (
                <button
                  onClick={() => setView('posting-queue')}
                  className="text-[11px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold animate-pulse hover:underline"
                >
                  Queue Active ({activeIndex}/{queue.length})
                </button>
              )}
              <button
                onClick={() => openDashboard()}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors"
                title="Open Full Dashboard"
              >
                <LayoutDashboard size={13} />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'my-groups'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users size={14} />
              <span>My Groups</span>
            </button>

            <button
              onClick={() => setActiveTab('import-links')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'import-links'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon size={14} />
              <span>Import Links</span>
            </button>
          </div>

          {/* Tab 1: My Groups Content */}
          {activeTab === 'my-groups' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              
              {/* Blue Sync Button */}
              <button
                onClick={isDiscovering ? handleCancelSync : handleTriggerFullSync}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isDiscovering
                    ? 'bg-blue-600 hover:bg-blue-700 opacity-90'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                }`}
              >
                <RefreshCw size={13} className={isDiscovering ? 'animate-spin' : ''} />
                <span>{isDiscovering ? 'Syncing...' : 'Sync from Facebook'}</span>
              </button>

              {/* Syncing Progress Card */}
              {isDiscovering && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                    Scanning your groups progressively. Keep this page open while we discover all joined groups.
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full animate-pulse w-full" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      <span>Scanning groups... Found {discoveryProgress.foundCount || groups.length} so far</span>
                      <span>Found {discoveryProgress.foundCount || groups.length}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <button
                      onClick={handleCancelSync}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
                    >
                      Cancel sync
                    </button>
                  </div>
                </div>
              )}

              {/* Last Synced Meta */}
              {!isDiscovering && lastSyncedFormatted && (
                <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                  Last synced: {lastSyncedFormatted}
                </div>
              )}

              {/* Empty State */}
              {groups.length === 0 && !isDiscovering ? (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Users size={24} />
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No groups synced yet
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Click "Sync from Facebook" to start
                  </div>
                </div>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      <button onClick={handleSelectAll} className="hover:underline">
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button onClick={handleClearAll} className="hover:underline text-slate-500 dark:text-slate-400">
                        Clear All
                      </button>
                    </div>

                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Groups count {selectedCount}/{groups.length}
                    </span>
                  </div>

                  {/* Helper text */}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                    Selection order becomes posting order.
                  </div>

                  {/* Group List */}
                  <div className="max-h-[170px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredGroups.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No groups match "{searchTerm}"
                      </div>
                    ) : (
                      filteredGroups.map(group => {
                        const isSelected = selectedIdsOrder.includes(group.id);
                        const orderIndex = selectedIdsOrder.indexOf(group.id) + 1;

                        return (
                            <div
                              key={group.id}
                              onClick={() => handleToggleGroup(group)}
                              className={`group/row flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-blue-50/70 dark:bg-blue-950/40'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              {/* Checkbox */}
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {isSelected && <Check size={10} strokeWidth={3} />}
                              </div>

                              {/* Group Avatar */}
                              {group.imageUrl ? (
                                <img
                                  src={group.imageUrl}
                                  alt={group.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-100"
                                  onError={e => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[10px] flex-shrink-0">
                                  {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
                                </div>
                              )}

                              {/* Group Name & Verified Badge */}
                              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate" title={group.name}>
                                  {group.name}
                                </div>
                                {group.verified && (
                                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                                )}
                              </div>

                              {/* Selection Order badge */}
                              {isSelected && (
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1 py-0.2 rounded-full flex-shrink-0">
                                  #{orderIndex}
                                </span>
                              )}

                              {/* Remove button */}
                              <button
                                onClick={(e) => handleDeleteGroup(e, group.id)}
                                className="opacity-0 group-hover/row:opacity-100 hover:text-rose-500 text-slate-400 p-0.5 rounded transition-opacity flex-shrink-0"
                                title="Remove from list"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Import Links Content */}
          {activeTab === 'import-links' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste Facebook Group URLs below (one per line):
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="https://www.facebook.com/groups/examplegroup1/&#10;https://facebook.com/groups/123456789/"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
              />

              <button
                onClick={handleImportLinks}
                disabled={!importText.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Import Groups
              </button>
            </div>
          )}

          {/* Footer Actions: Confirm Transitions into Composer */}
          <div className="flex items-center gap-2.5 p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <button
              onClick={handleSaveAsList}
              className="flex-1 py-2 px-3 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
            >
              Save as List
            </button>

            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-[0.99]"
            >
              Confirm ({selectedCount})
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: IN-POPUP POST COMPOSER (Caption, Media & Submit Post) */}
      {/* ========================================================================= */}
      {view === 'compose' && (
        <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
          
          {/* Header with Back Button */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button
              onClick={() => setView('select-groups')}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Groups</span>
            </button>

            <div className="text-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Compose Post
              </h2>
            </div>

            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {selectedCount} Target
            </span>
          </div>

          {/* Composer Form Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            
            {/* Target Groups Order Summary */}
            <div className="p-2 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span className="font-semibold">
                Posting sequentially to {selectedCount} groups
              </span>
              <button
                onClick={() => setView('select-groups')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[10px]"
              >
                Edit Order
              </button>
            </div>

            {/* Caption Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Post Caption / Description *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAiPolish}
                    disabled={isPolishingAi}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <Sparkles size={11} className={isPolishingAi ? 'animate-spin' : ''} />
                    <span>{isPolishingAi ? 'Polishing...' : 'AI Polish'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">
                    {caption.length} chars
                  </span>
                </div>
              </div>

              {/* Design Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-1 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl text-[11px]">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAutoBeautify}
                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 rounded flex items-center gap-1 transition-all"
                    title="১-ক্লিকে অটো-ডিজাইন (Italic Title, Spec Bullets & Condition Notes)"
                  >
                    <Sparkles size={11} />
                    <span>✨ Auto-Design</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStyle('sans-italic')}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200"
                    title="Italic font (e.g. 𝘴𝘢𝘭𝘦)"
                  >
                    <span className="italic font-serif">𝘐</span> Italic
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStyle('sans-bold')}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200"
                    title="Bold font (e.g. 𝘀𝗮𝗹𝗲)"
                  >
                    <span className="font-bold">𝐁</span> Bold
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyBullets}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200 flex items-center gap-0.5"
                    title="Bullet list"
                  >
                    <span className="text-blue-500">•</span> Bullets
                  </button>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyStyle(e.target.value as FontStyleType);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    <option value="" disabled>🔤 Style</option>
                    <option value="sans-italic">𝘴𝘢𝘭𝘦 (Italic)</option>
                    <option value="sans-bold">𝘀𝗮𝗹𝗲 (Bold)</option>
                    <option value="sans-bold-italic">𝙨𝙖𝙡𝙚 (Bold Italic)</option>
                    <option value="serif-italic">𝑠𝑎𝑙𝑒 (Serif Italic)</option>
                    <option value="serif-bold">𝐬𝐚ｌｅ (Serif Bold)</option>
                    <option value="monospace">𝚜𝚊𝚕𝚎 (Monospace)</option>
                    <option value="normal">sale (Clear)</option>
                  </select>
                </div>
              </div>

              {/* Duplicate Detection Alert */}
              {caption.trim() && deduplicateRepeatedCaption(caption) !== caption && (
                <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg text-[11px] text-amber-700 dark:text-amber-300">
                  <span>⚠️ ডুপ্লিকেট ক্যাপশন ধরা পড়েছে</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCaption(deduplicateRepeatedCaption(caption));
                      showToast('ডুপ্লিকেট লেখা দূর করা হয়েছে!');
                    }}
                    className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded text-[10px] transition-colors"
                  >
                    মুছুন (Fix)
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                rows={5}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                onPaste={handlePasteCaption}
                placeholder="What are you posting? Write your full listing caption, details, price, phone number...&#10;&#10;e.g. 𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-b-xl rounded-t-none border-t-0 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              />

              {/* Quick Emojis */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs">
                {['🔥', '🏍️', '⚡', '💰', '📞', '📍', '✨', '👉', '✅', '💥'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Media / Photos & Videos Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-blue-500" />
                  <span>Attach Media ({images.length})</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                >
                  <UploadCloud size={13} />
                  <span>Add Photos/Videos</span>
                </button>
              </div>

              {/* Media Thumbnails Preview */}
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 max-h-[110px] overflow-y-auto">
                  {images.map((img, idx) => {
                    const isVideo = img.startsWith('data:video') || img.includes('video') || img.endsWith('.mp4') || img.endsWith('.webm') || img.endsWith('.mov');
                    return (
                      <div key={idx} className="relative group w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                        {isVideo ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                            <video src={img} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 bg-black/80 text-emerald-400 text-[9px] font-bold px-1 rounded flex items-center gap-0.5">
                              ▶ Video
                            </span>
                          </div>
                        ) : (
                          <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors z-10"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Click to select photos or videos (MP4, WEBM) to post
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Listing Details */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold py-1"
              >
                <span>Optional Listing Details (Price, Phone, Location)</span>
                {showOptionalFields ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showOptionalFields && (
                <div className="space-y-2 pt-1.5 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Product / Title (e.g. Yamaha FZ-S Version 3)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Price (e.g. ৳ 1,85,000)"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phone (e.g. 017XXXXXXXX)"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Location (e.g. Dhaka, Feni, Mirpur)"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {/* Delay Interval Selection */}
            <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Clock size={12} />
                <span>Pacing Delay:</span>
              </span>
              <div className="flex items-center gap-1 font-bold">
                {[
                  { sec: 0, label: '0s (Instant)' },
                  { sec: 2, label: '2s' },
                  { sec: 5, label: '5s' },
                  { sec: 10, label: '10s' },
                ].map(({ sec, label }) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDelaySec(sec)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                      delaySec === sec
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Submit Button */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <button
              onClick={handleStartPosting}
              disabled={isSubmittingPost || !caption.trim()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmittingPost ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Starting Posting Queue...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Start Posting to {selectedCount} Groups</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: IN-POPUP LIVE POSTING QUEUE (Sequential Tab Posting Progress) */}
      {/* ========================================================================= */}
      {view === 'posting-queue' && (
        <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button
              onClick={() => setView('select-groups')}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Groups</span>
            </button>

            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Posting Progress
            </h2>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              {queueState.isRunning ? 'Active' : 'Finished'}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            
            {/* Progress Bar & Percentage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>
                  Posting {activeIndex > 0 ? activeIndex : postedCount} of {queue.length} groups
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Currently Active Group Card */}
            {activeGroup ? (
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Current Group (#{activeIndex})</span>
                  </span>

                  <button
                    onClick={() => openGroupTab(activeGroup.url)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open Tab</span>
                    <ExternalLink size={11} />
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  {activeGroup.imageUrl ? (
                    <img
                      src={activeGroup.imageUrl}
                      alt={activeGroup.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-800 dark:text-blue-200 text-xs flex-shrink-0">
                      {activeGroup.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={activeGroup.name}>
                      {activeGroup.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      ⚡ Auto-posting is running automatically. Hands-free!
                    </div>
                  </div>
                </div>

                {/* Caption Snippet */}
                {activePost && (
                  <div className="text-[11px] bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 max-h-16 overflow-y-auto leading-relaxed">
                    {activePost.caption || activePost.description}
                  </div>
                )}

                {/* Queue Controls for Current Item */}
                <div className="space-y-1.5 pt-1">
                  <div className="w-full py-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>⚡ Auto-Posting in Progress (Hands-Free)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSkipCurrent(activeItem?.id)}
                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <SkipForward size={12} />
                      <span>Skip</span>
                    </button>

                    <button
                      onClick={() => sendMessage(queueState.isPaused ? 'RESUME_QUEUE' : 'PAUSE_QUEUE')}
                      className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      {queueState.isPaused ? <Play size={12} /> : <Pause size={12} />}
                      <span>{queueState.isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={() => sendMessage('STOP_QUEUE')}
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                      title="Stop Posting Session"
                    >
                      <StopCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {queue.length > 0 && postedCount === queue.length
                    ? '🎉 All Groups Completed!'
                    : queue.length > 0
                    ? `Queue Ready (${queue.length - postedCount} remaining)`
                    : 'Queue is Idle'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {queue.length > 0 && postedCount === queue.length
                    ? `Successfully processed ${queue.length} groups!`
                    : queue.length > 0
                    ? 'Click below to start or resume auto-posting to your groups.'
                    : 'Select groups and click "Start Posting" to begin.'}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {queue.length > 0 && postedCount < queue.length && (
                    <button
                      onClick={() => sendMessage('START_QUEUE')}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Play size={13} />
                      <span>Start / Resume Auto-Posting</span>
                    </button>
                  )}
                  <button
                    onClick={() => setView('select-groups')}
                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                  >
                    Back to Select Groups
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Sequence List */}
            {queue.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Upcoming Queue ({queue.filter(q => q.status === 'READY' || q.status === 'PENDING' || q.status === 'IN_PROGRESS').length} remaining)
                </div>

                <div className="max-h-[140px] overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60 pr-1">
                  {queue.map((item, idx) => {
                    const g = groups.find(grp => grp.id === item.groupId || grp.groupId === item.groupId);
                    const displayName = g?.name || item.groupName || 'Facebook Group';
                    const isCurrent = item.id === queueState.currentItemId;
                    const isDone = item.status === 'POSTED';
                    const isSkipped = item.status === 'SKIPPED';

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-900 dark:text-blue-300'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="w-5 text-[10px] text-slate-400 font-mono">
                          #{idx + 1}
                        </span>

                        <span className="flex-1 truncate" title={displayName}>
                          {displayName}
                        </span>

                        {isDone && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                            Posted
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                            Skipped
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.2 rounded animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Navigation */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs flex-shrink-0">
            <button
              onClick={() => setView('select-groups')}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold"
            >
              ← Select Groups
            </button>
            <button
              onClick={() => openDashboard('queue')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Full Queue View ↗
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
