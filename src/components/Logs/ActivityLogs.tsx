import React, { useState, useMemo } from 'react';
import { LogEntry, LogLevel } from '../../types/log';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Download,
  Trash2,
  Search,
  Filter,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { formatTime, downloadFile } from '../../utils/helpers';
import { useToast } from '../common/Toast';

interface ActivityLogsProps {
  logs: LogEntry[];
  onClearLogs: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
}) => {
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(entry => {
      const matchesSearch =
        searchTerm === '' ||
        entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.details && JSON.stringify(entry.details).toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLevel = levelFilter === 'ALL' || entry.level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, levelFilter]);

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    downloadFile(`ai-group-poster-logs-${Date.now()}.json`, jsonStr, 'application/json');
    toast.success('Logs exported');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={onRefreshLogs}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportLogs}
            disabled={logs.length === 0}
          >
            Export JSON
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={logs.length === 0}
          >
            Clear Logs
          </Button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredLogs.length}</span> of{' '}
          <span className="text-white font-bold">{logs.length}</span> log entries
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs by message or source..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Terminal-style Log Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-indigo-400" />
            <span className="font-bold text-slate-200">System Activity Stream</span>
          </div>
          <span className="text-slate-500">Auto-persisted to Chrome Storage</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            No activity logs found. As background actions and queue events occur, they will stream here.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-2">
            {filteredLogs.map(entry => {
              const levelColors: Record<LogLevel, string> = {
                INFO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                ERROR: 'text-red-400 bg-red-500/10 border-red-500/20',
              };

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-slate-900/60 transition group text-[11px]"
                >
                  <span className="text-slate-500 flex-shrink-0 font-normal">
                    {formatTime(entry.timestamp)}
                  </span>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 uppercase ${
                      levelColors[entry.level]
                    }`}
                  >
                    {entry.level}
                  </span>

                  <span className="text-slate-400 text-[10px] uppercase font-bold flex-shrink-0">
                    [{entry.source}]
                  </span>

                  <span className="text-slate-200 flex-1 leading-relaxed break-words">
                    {entry.message}
                    {entry.details && (
                      <span className="block text-[10px] text-slate-400 mt-0.5 bg-slate-900 p-1.5 rounded border border-slate-800">
                        {typeof entry.details === 'string'
                          ? entry.details
                          : JSON.stringify(entry.details)}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={async () => {
          await onClearLogs();
          toast.info('Activity logs cleared');
          setIsConfirmClearOpen(false);
        }}
        title="Clear Activity Logs"
        message="Are you sure you want to clear all activity logs?"
        confirmLabel="Clear Logs"
      />
    </div>
  );
};
