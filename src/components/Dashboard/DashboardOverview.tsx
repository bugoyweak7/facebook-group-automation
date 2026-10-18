import React, { useState, useEffect } from 'react';
import { Group, FacebookAccountInfo } from '../../types/group';
import { Post } from '../../types/post';
import { QueueItem, QueueState, QueueStatistics } from '../../types/queue';
import { HistoryRecord } from '../../types/history';
import { getFacebookAccount } from '../../services/storage/chrome-storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Users,
  CheckSquare,
  ListOrdered,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Square,
  ExternalLink,
  Compass,
  ArrowRight,
  Sparkles,
  PenSquare,
} from 'lucide-react';
import { TabType } from '../layout/Sidebar';
import { formatTime } from '../../utils/helpers';

interface DashboardOverviewProps {
  groups: Group[];
  posts: Post[];
  queue: QueueItem[];
  queueState: QueueState;
  queueStats: QueueStatistics;
  history: HistoryRecord[];
  onNavigateTab: (tab: TabType) => void;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onStopQueue: () => void;
  onOpenGroupUrl: (url: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  groups,
  posts,
  queue,
  queueState,
  queueStats,
  history,
  onNavigateTab,
  onStartQueue,
  onPauseQueue,
  onResumeQueue,
  onStopQueue,
  onOpenGroupUrl,
}) => {
  const [account, setAccount] = useState<FacebookAccountInfo | null>(null);

  useEffect(() => {
    getFacebookAccount().then(setAccount);
  }, []);

  // Current active queue item details
  const activeItem = queueState.currentItemId
    ? queue.find(q => q.id === queueState.currentItemId)
    : null;
  const activeGroup = activeItem ? groups.find(g => g.id === activeItem.groupId) : null;
  const activePost = activeItem ? posts.find(p => p.id === activeItem.postId) : null;
  const activeIndex = activeItem ? queue.findIndex(q => q.id === activeItem.id) + 1 : 0;

  // Real metric counters
  const totalGroups = groups.length;
  const totalSelected = groups.filter(g => g.selected).length;
  const totalQueueItems = queue.length;

  // Calculate posted today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const postedToday = history.filter(
    h => h.status === 'POSTED' && h.postedAt >= startOfDay.getTime()
  ).length;

  const totalPending = queue.filter(q => q.status === 'PENDING' || q.status === 'READY').length;
  const totalFailed = queueStats.failed + history.filter(h => h.status === 'FAILED').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {account?.name ? `Connected: ${account.name}` : 'Facebook Group Posting Assistant'}
            </span>
            {account?.name && <Badge variant="success" size="sm">Active Account</Badge>}
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Human-in-the-loop workflow. Select joined Facebook groups, prepare post copy and media, and post sequentially with zero spam risk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={<Compass size={16} />}
            onClick={() => onNavigateTab('groups')}
            className="bg-indigo-600 hover:bg-indigo-500 font-bold"
          >
            My Facebook Groups
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<PenSquare size={16} />}
            onClick={() => onNavigateTab('composer')}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* 6 Top Metric Cards Required by User */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. My Groups */}
        <div onClick={() => onNavigateTab('groups')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">My Groups</span>
              <Users size={16} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalGroups}</div>
            <div className="text-[11px] text-slate-500 mt-1">Available in account</div>
          </Card>
        </div>

        {/* 2. Selected */}
        <div onClick={() => onNavigateTab('groups')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Selected</span>
              <CheckSquare size={16} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">{totalSelected}</div>
            <div className="text-[11px] text-slate-500 mt-1">Marked for posting</div>
          </Card>
        </div>

        {/* 3. Queue Items */}
        <div onClick={() => onNavigateTab('queue')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Queue Items</span>
              <ListOrdered size={16} className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{totalQueueItems}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total in active queue</div>
          </Card>
        </div>

        {/* 4. Posted Today */}
        <div onClick={() => onNavigateTab('history')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Posted Today</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{postedToday}</div>
            <div className="text-[11px] text-slate-500 mt-1">Confirmed posts</div>
          </Card>
        </div>

        {/* 5. Pending */}
        <div onClick={() => onNavigateTab('queue')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Pending</span>
              <Clock size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{totalPending}</div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting review</div>
          </Card>
        </div>

        {/* 6. Failed */}
        <div onClick={() => onNavigateTab('history')} className="cursor-pointer">
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Failed</span>
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{totalFailed}</div>
            <div className="text-[11px] text-slate-500 mt-1">Errors or skipped</div>
          </Card>
        </div>
      </div>

      {/* Current Posting Session Section */}
      <Card className="p-6 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${
              queueState.isRunning
                ? queueState.isPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
                : 'bg-slate-600'
            }`} />
            <h3 className="text-base font-bold text-white tracking-wide">
              Current Posting Session
            </h3>
          </div>

          <div>
            {queueState.isRunning ? (
              queueState.isPaused ? (
                <Badge variant="warning" size="md">Session Paused</Badge>
              ) : (
                <Badge variant="success" size="md">Active Session</Badge>
              )
            ) : (
              <Badge variant="default" size="md">No Active Session</Badge>
            )}
          </div>
        </div>

        {activeGroup ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Current Target Group
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {activeGroup.name}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  URL: <span className="text-slate-300">{activeGroup.url}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Session Progress</div>
                  <div className="text-2xl font-black text-white">
                    {activeIndex} <span className="text-sm font-normal text-slate-400">/ {queue.length}</span>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-indigo-300 text-lg">
                  {Math.round((activeIndex / (queue.length || 1)) * 100)}%
                </div>
              </div>
            </div>

            {/* Session Controls Required by User */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={<ExternalLink size={16} />}
                onClick={() => onOpenGroupUrl(activeGroup.url)}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold"
              >
                Open Current Group
              </Button>

              {queueState.isRunning && !queueState.isPaused && (
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Pause size={16} />}
                  onClick={onPauseQueue}
                >
                  Pause Session
                </Button>
              )}

              {queueState.isRunning && queueState.isPaused && (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Play size={16} />}
                  onClick={onResumeQueue}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Resume Session
                </Button>
              )}

              {queueState.isRunning && (
                <Button
                  variant="danger"
                  size="md"
                  icon={<Square size={16} />}
                  onClick={onStopQueue}
                >
                  Stop Session
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <ListOrdered size={36} className="mx-auto text-slate-600" />
            <div>
              <h4 className="text-base font-semibold text-white">Ready to Start a Posting Session?</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {totalQueueItems > 0
                  ? `You have ${totalQueueItems} items waiting in the queue. Start the session to open groups sequentially.`
                  : totalSelected > 0
                  ? `You have ${totalSelected} groups selected. Create a post in the Composer to build your queue.`
                  : totalGroups > 0
                  ? `Select groups from your list to prepare a posting session.`
                  : `First, discover the Facebook groups available to your logged-in Facebook account.`}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {totalQueueItems > 0 ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play size={18} />}
                  onClick={onStartQueue}
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold px-6"
                >
                  Start Posting Session ({totalQueueItems} Items)
                </Button>
              ) : totalSelected > 0 ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={16} />}
                  onClick={() => onNavigateTab('composer')}
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                >
                  Proceed to Composer with {totalSelected} Groups
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={<Compass size={16} />}
                  onClick={() => onNavigateTab('groups')}
                  className="bg-indigo-600 hover:bg-indigo-500 font-bold"
                >
                  {totalGroups > 0 ? 'Select Groups in My Facebook Groups' : 'Discover My Facebook Groups'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
