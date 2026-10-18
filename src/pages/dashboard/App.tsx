import React, { useState, useEffect, useCallback } from 'react';
import { Group } from '../../types/group';
import { Post, PostTemplate } from '../../types/post';
import { QueueItem, QueueState, QueueStatistics } from '../../types/queue';
import { HistoryRecord } from '../../types/history';
import { LogEntry } from '../../types/log';
import { AppSettings } from '../../types/settings';
import { DEFAULT_SETTINGS, DEFAULT_TEMPLATES } from '../../utils/constants';
import {
  getGroups,
  setGroups,
  saveGroup,
  deleteGroup,
  getPosts,
  setPosts,
  savePost,
  deletePost,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  getQueue,
  setQueue,
  clearCompletedQueue,
  getQueueState,
  getHistory,
  clearHistory,
  getLogs,
  clearLogs,
  getSettings,
  updateSettings,
  resetAllData,
  INITIAL_QUEUE_STATE,
} from '../../services/storage/chrome-storage';
import {
  calculateQueueStats,
  moveQueueItem,
  createQueueItems,
} from '../../services/queue/queue-engine';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TabType } from '../../components/layout/Sidebar';
import { DashboardOverview } from '../../components/Dashboard/DashboardOverview';
import { MyFacebookGroups } from '../../components/Groups/MyFacebookGroups';
import { PostComposer } from '../../components/Composer/PostComposer';
import { AICaptionGenerator } from '../../components/AI/AICaptionGenerator';
import { QueueManager } from '../../components/Queue/QueueManager';
import { PostingHistory } from '../../components/History/PostingHistory';
import { ActivityLogs } from '../../components/Logs/ActivityLogs';
import { TemplatesManager } from '../../components/Templates/TemplatesManager';
import { SettingsManager } from '../../components/Settings/SettingsManager';
import { OnboardingModal } from '../../components/Onboarding/OnboardingModal';
import { ToastProvider, useToast } from '../../components/common/Toast';

const DashboardContent: React.FC = () => {
  const toast = useToast();

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Application Data Stores (Real stored data)
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [templates, setTemplatesState] = useState<PostTemplate[]>([]);
  const [queue, setQueueStateStore] = useState<QueueItem[]>([]);
  const [queueState, setQueueStateObj] = useState<QueueState>(INITIAL_QUEUE_STATE);
  const [history, setHistoryState] = useState<HistoryRecord[]>([]);
  const [logs, setLogsState] = useState<LogEntry[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [activeComposerPostId, setActiveComposerPostId] = useState<string>('');

  // Load all data from storage
  const loadAllData = useCallback(async () => {
    try {
      const [g, p, t, q, qs, h, l, s] = await Promise.all([
        getGroups(),
        getPosts(),
        getTemplates(),
        getQueue(),
        getQueueState(),
        getHistory(),
        getLogs(),
        getSettings(),
      ]);

      setGroupsState(g);
      setPostsState(p);
      setTemplatesState(t.length > 0 ? t : DEFAULT_TEMPLATES);
      setQueueStateStore(q);
      setQueueStateObj(qs);
      setHistoryState(h);
      setLogsState(l);
      setSettingsState(s);

      // Check first-time onboarding
      if (!s.hasCompletedOnboarding && g.length === 0) {
        setIsOnboardingOpen(true);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Listen for storage changes across popup or background
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = () => {
        loadAllData();
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, [loadAllData]);

  // Statistics
  const queueStats = calculateQueueStats(queue);
  const selectedGroupIds = groups.filter(g => g.selected).map(g => g.id);

  // Background runtime messaging dispatcher
  const sendBackgroundMessage = (type: string, payload?: unknown) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type, payload }, () => {
        setTimeout(loadAllData, 300);
      });
    } else {
      toast.info(`Action triggered: ${type}`);
    }
  };

  // Queue actions
  const handleStartQueue = () => sendBackgroundMessage('START_QUEUE');
  const handlePauseQueue = () => sendBackgroundMessage('PAUSE_QUEUE');
  const handleResumeQueue = () => sendBackgroundMessage('RESUME_QUEUE');
  const handleStopQueue = () => sendBackgroundMessage('STOP_QUEUE');
  const handleMarkPosted = async (id: string) => { sendBackgroundMessage('MARK_AS_POSTED', { itemId: id }); };
  const handleSkipItem = async (id: string) => { sendBackgroundMessage('SKIP_CURRENT_ITEM', { itemId: id }); };
  const handleRetryItem = async (id: string) => { sendBackgroundMessage('RETRY_CURRENT_ITEM', { itemId: id }); };

  const handleOpenGroupUrl = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url, active: true });
    } else {
      window.open(url, '_blank');
    }
  };

  // Group actions
  const handleSaveGroup = async (group: Group) => {
    await saveGroup(group);
    await loadAllData();
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroup(id);
    await loadAllData();
  };

  const handleImportGroups = async (imported: Group[]) => {
    const existing = await getGroups();
    const updated = [...imported, ...existing];
    await setGroups(updated);
    await loadAllData();
  };

  // Post actions
  const handleSavePost = async (post: Post) => {
    await savePost(post);
    await loadAllData();
  };

  const handleDeletePost = async (id: string) => {
    await deletePost(id);
    await loadAllData();
  };

  // Template actions
  const handleSaveTemplate = async (tpl: PostTemplate) => {
    await saveTemplate(tpl);
    await loadAllData();
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    await loadAllData();
  };

  // Queue item ordering & modifications
  const handleMoveQueueItem = async (id: string, direction: 'UP' | 'DOWN') => {
    await moveQueueItem(id, direction);
    await loadAllData();
  };

  const handleDeleteQueueItem = async (id: string) => {
    const q = await getQueue();
    const filtered = q.filter(item => item.id !== id);
    await setQueue(filtered);
    await loadAllData();
    toast.info('Item removed from queue');
  };

  const handleClearCompletedQueue = async () => {
    await clearCompletedQueue();
    await loadAllData();
    toast.info('Completed and skipped items cleared from queue');
  };

  const handleCreateBatchQueue = async (groupIds: string[], postId: string) => {
    await createQueueItems(groupIds, postId);
    await loadAllData();
  };

  // History & logs
  const handleClearHistory = async () => {
    await clearHistory();
    await loadAllData();
  };

  const handleClearLogs = async () => {
    await clearLogs();
    await loadAllData();
  };

  // Settings
  const handleSaveSettings = async (partial: Partial<AppSettings>) => {
    await updateSettings(partial);
    await loadAllData();
  };

  const handleResetAll = async () => {
    await resetAllData();
    await loadAllData();
  };

  // Transition from Groups selection to Composer
  const handleProceedToComposer = (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one group first.');
      return;
    }
    setCurrentTab('composer');
  };

  // Title & description for current tab
  const tabTitles: Record<TabType, { title: string; description: string }> = {
    dashboard: {
      title: 'Workflow Dashboard',
      description: 'Account overview, session metrics, active group status, and quick shortcuts.',
    },
    groups: {
      title: 'My Facebook Groups',
      description: 'Discover joined groups from your active Facebook account, select groups, and organize categories.',
    },
    composer: {
      title: 'Create Post',
      description: 'Compose captions, upload and reorder media, preview listings, and build your posting queue.',
    },
    queue: {
      title: 'Posting Queue',
      description: 'Sequential human-in-the-loop posting session with step-by-step review and wrong-group protection.',
    },
    history: {
      title: 'History',
      description: 'Permanent log of all user-confirmed group posts and timestamps.',
    },
    ai: {
      title: 'AI Writer',
      description: 'Craft high-converting copy in Bangla, Banglish, or English via OpenAI, Gemini, or Custom API.',
    },
    templates: {
      title: 'Templates',
      description: 'Custom message layouts with dynamic tags like {product_name}, {price}, and {location}.',
    },
    logs: {
      title: 'Logs',
      description: 'Real-time diagnostic stream for background workers and Facebook content script handshakes.',
    },
    settings: {
      title: 'Settings',
      description: 'AI endpoints, safe pacing intervals, and database management.',
    },
  };

  return (
    <DashboardLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      title={tabTitles[currentTab].title}
      description={tabTitles[currentTab].description}
      queueCount={queue.filter(q => q.status === 'READY' || q.status === 'PENDING').length}
      queueState={queueState}
      hasGroups={groups.length > 0}
      onStartQueue={handleStartQueue}
      onPauseQueue={handlePauseQueue}
      onResumeQueue={handleResumeQueue}
      onOpenOnboarding={() => setIsOnboardingOpen(true)}
      onLoadDemoData={async () => {
        // Safe demo loader if explicitly requested
        toast.info('Please use "Discover My Facebook Groups" with your logged-in Facebook account.');
      }}
    >
      {currentTab === 'dashboard' && (
        <DashboardOverview
          groups={groups}
          posts={posts}
          queue={queue}
          queueState={queueState}
          queueStats={queueStats}
          history={history}
          onNavigateTab={setCurrentTab}
          onStartQueue={handleStartQueue}
          onPauseQueue={handlePauseQueue}
          onResumeQueue={handleResumeQueue}
          onStopQueue={handleStopQueue}
          onOpenGroupUrl={handleOpenGroupUrl}
        />
      )}

      {currentTab === 'groups' && (
        <MyFacebookGroups
          groups={groups}
          onSaveGroup={handleSaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onImportGroups={handleImportGroups}
          onOpenGroupUrl={handleOpenGroupUrl}
          onProceedToPost={handleProceedToComposer}
        />
      )}

      {currentTab === 'composer' && (
        <PostComposer
          posts={posts}
          templates={templates}
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          activePostId={activeComposerPostId}
          settings={settings}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          onCreateQueue={handleCreateBatchQueue}
          onNavigateTab={setCurrentTab}
        />
      )}

      {currentTab === 'queue' && (
        <QueueManager
          queue={queue}
          queueState={queueState}
          queueStats={queueStats}
          groups={groups}
          posts={posts}
          onStartQueue={handleStartQueue}
          onPauseQueue={handlePauseQueue}
          onResumeQueue={handleResumeQueue}
          onStopQueue={handleStopQueue}
          onMoveQueueItem={handleMoveQueueItem}
          onMarkPosted={handleMarkPosted}
          onSkipItem={handleSkipItem}
          onRetryItem={handleRetryItem}
          onDeleteQueueItem={handleDeleteQueueItem}
          onClearCompleted={handleClearCompletedQueue}
          onCreateBatchQueue={handleCreateBatchQueue}
          onOpenGroupUrl={handleOpenGroupUrl}
        />
      )}

      {currentTab === 'history' && (
        <PostingHistory
          history={history}
          onClearHistory={handleClearHistory}
          onOpenGroupUrl={handleOpenGroupUrl}
        />
      )}

      {currentTab === 'ai' && (
        <AICaptionGenerator
          settings={settings}
          onApplyCaptionToPost={caption => {
            if (posts.length > 0) {
              const p = posts[0];
              handleSavePost({ ...p, caption });
              setActiveComposerPostId(p.id);
            }
          }}
          onNavigateTab={setCurrentTab}
        />
      )}

      {currentTab === 'templates' && (
        <TemplatesManager
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}

      {currentTab === 'logs' && (
        <ActivityLogs
          logs={logs}
          onClearLogs={handleClearLogs}
          onRefreshLogs={loadAllData}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsManager
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetAllData={handleResetAll}
          onReloadData={loadAllData}
        />
      )}

      {/* Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={async () => {
          setIsOnboardingOpen(false);
          await updateSettings({ hasCompletedOnboarding: true });
        }}
        onLoadDemoData={() => {
          setIsOnboardingOpen(false);
          setCurrentTab('groups');
        }}
      />
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
};
