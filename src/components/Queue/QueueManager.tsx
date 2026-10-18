import React, { useState } from 'react';
import { QueueItem, QueueState, QueueStatistics, QueueStatus } from '../../types/queue';
import { Group } from '../../types/group';
import { Post } from '../../types/post';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Play,
  Pause,
  Square,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCcw,
  CheckCircle2,
  SkipForward,
  ExternalLink,
  PlusCircle,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { formatDate, formatTime } from '../../utils/helpers';

interface QueueManagerProps {
  queue: QueueItem[];
  queueState: QueueState;
  queueStats: QueueStatistics;
  groups: Group[];
  posts: Post[];
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onStopQueue: () => void;
  onMoveQueueItem: (id: string, direction: 'UP' | 'DOWN') => Promise<void>;
  onMarkPosted: (id: string) => Promise<void>;
  onSkipItem: (id: string) => Promise<void>;
  onRetryItem: (id: string) => Promise<void>;
  onDeleteQueueItem: (id: string) => Promise<void>;
  onClearCompleted: () => Promise<void>;
  onCreateBatchQueue: (groupIds: string[], postId: string) => Promise<void>;
  onOpenGroupUrl: (url: string) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  queueState,
  queueStats,
  groups,
  posts,
  onStartQueue,
  onPauseQueue,
  onResumeQueue,
  onStopQueue,
  onMoveQueueItem,
  onMarkPosted,
  onSkipItem,
  onRetryItem,
  onDeleteQueueItem,
  onClearCompleted,
  onCreateBatchQueue,
  onOpenGroupUrl,
}) => {
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Batch create queue modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');

  // Filtered queue items
  const filteredQueue = queue.filter(item => {
    const group = groups.find(g => g.id === item.groupId);
    const post = posts.find(p => p.id === item.postId);

    const matchesSearch =
      searchTerm === '' ||
      (group?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (post?.title.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenBatchModal = () => {
    setSelectedGroupIds(groups.filter(g => g.enabled).map(g => g.id));
    setSelectedPostId(posts[0]?.id || '');
    setIsBatchModalOpen(true);
  };

  const handleToggleSelectGroup = (id: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.length === groups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(groups.map(g => g.id));
    }
  };

  const handleCreateBatch = async () => {
    if (selectedGroupIds.length === 0) {
      toast.error('Select at least one group');
      return;
    }
    if (!selectedPostId) {
      toast.error('Select a post to attach to this queue');
      return;
    }

    await onCreateBatchQueue(selectedGroupIds, selectedPostId);
    toast.success(`Added ${selectedGroupIds.length} items to posting queue!`);
    setIsBatchModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {queueState.isRunning ? (
            queueState.isPaused ? (
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                onClick={onResumeQueue}
              >
                Resume Queue
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pause size={14} className="text-amber-400" />}
                onClick={onPauseQueue}
              >
                Pause Queue
              </Button>
            )
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Play size={14} />}
              onClick={onStartQueue}
              disabled={queue.length === 0}
            >
              Start Queue
            </Button>
          )}

          {queueState.isRunning && (
            <Button
              variant="danger"
              size="sm"
              icon={<Square size={14} />}
              onClick={onStopQueue}
            >
              Stop Queue
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={<PlusCircle size={14} />}
            onClick={handleOpenBatchModal}
            disabled={groups.length === 0 || posts.length === 0}
          >
            Add Groups to Queue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearCompleted}
            disabled={!queue.some(q => q.status === 'POSTED' || q.status === 'SKIPPED')}
          >
            Clear Completed
          </Button>
        </div>

        {/* Real-time stats indicators */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Total: <strong className="text-white">{queueStats.total}</strong></span>
          <span className="text-amber-400">Pending: <strong>{queueStats.pending}</strong></span>
          <span className="text-blue-400">Ready: <strong>{queueStats.ready}</strong></span>
          <span className="text-emerald-400">Posted: <strong>{queueStats.posted}</strong></span>
          {queueStats.failed > 0 && (
            <span className="text-red-400">Failed: <strong>{queueStats.failed}</strong></span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search queue by group name or post title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_USER">Waiting for Review</option>
              <option value="POSTED">Posted</option>
              <option value="SKIPPED">Skipped</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card className="p-0 overflow-hidden">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-semibold text-slate-200">Queue is Empty</p>
            <p className="text-xs mt-1">
              {queue.length === 0
                ? 'Select groups and an active post to prepare your next posting queue.'
                : 'No queue items matched your search/filter criteria.'}
            </p>
            {queue.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                icon={<PlusCircle size={14} />}
                onClick={handleOpenBatchModal}
                disabled={groups.length === 0 || posts.length === 0}
              >
                Add Groups to Queue
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold">Target Group</th>
                  <th className="py-3 px-4 font-semibold">Post Attached</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Reorder</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQueue.map((item, index) => {
                  const group = groups.find(g => g.id === item.groupId);
                  const post = posts.find(p => p.id === item.postId);
                  const isCurrent = queueState.currentItemId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white max-w-[220px] truncate" title={group?.name}>
                          {group ? group.name : 'Unknown Group'}
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-[220px] truncate" title={group?.url}>
                          {group?.url}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-200 font-medium max-w-[200px] truncate block" title={post?.title}>
                          {post ? post.title : 'Unknown Post'}
                        </span>
                        {post?.price && (
                          <span className="text-[11px] text-emerald-400 font-semibold">{post.price}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge status={item.status}>{item.status}</Badge>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-indigo-400 animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        {item.errorMessage && (
                          <span className="text-[10px] text-red-400 mt-0.5 block max-w-[160px] truncate" title={item.errorMessage}>
                            {item.errorMessage}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => onMoveQueueItem(item.id, 'UP')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            disabled={index === filteredQueue.length - 1}
                            onClick={() => onMoveQueueItem(item.id, 'DOWN')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {group && (
                            <button
                              onClick={() => onOpenGroupUrl(group.url)}
                              title="Open in Tab"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                            >
                              <ExternalLink size={13} />
                            </button>
                          )}

                          {item.status !== 'POSTED' && (
                            <button
                              onClick={() => onMarkPosted(item.id)}
                              title="Mark as Posted"
                              className="p-1.5 rounded hover:bg-emerald-900/30 text-emerald-400"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {item.status !== 'SKIPPED' && item.status !== 'POSTED' && (
                            <button
                              onClick={() => onSkipItem(item.id)}
                              title="Skip Item"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                            >
                              <SkipForward size={14} />
                            </button>
                          )}

                          {item.status === 'FAILED' && (
                            <button
                              onClick={() => onRetryItem(item.id)}
                              title="Retry Item"
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteQueueItem(item.id)}
                            title="Remove from Queue"
                            className="p-1.5 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Groups to Queue Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Add Groups to Posting Queue"
        description="Select groups and choose which prepared post will be published to them."
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Post to Attach *</label>
            <select
              value={selectedPostId}
              onChange={e => setSelectedPostId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              {posts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.productName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-300 font-semibold">
                Select Groups ({selectedGroupIds.length} of {groups.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAllGroups}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold"
              >
                {selectedGroupIds.length === groups.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl p-2 space-y-1 bg-slate-950">
              {groups.map(g => (
                <label
                  key={g.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(g.id)}
                      onChange={() => handleToggleSelectGroup(g.id)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white">{g.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[260px]">{g.url}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {g.category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateBatch}
              disabled={selectedGroupIds.length === 0 || !selectedPostId}
            >
              Add {selectedGroupIds.length} Groups to Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
