import React, { useState, useMemo } from 'react';
import { HistoryRecord, HistoryStatus } from '../../types/history';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Download,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatDate, formatTime, downloadFile } from '../../utils/helpers';
import { exportHistoryToCsv } from '../../services/csv/csv-parser';
import { useToast } from '../common/Toast';

interface PostingHistoryProps {
  history: HistoryRecord[];
  onClearHistory: () => Promise<void>;
  onOpenGroupUrl: (url: string) => void;
}

export const PostingHistory: React.FC<PostingHistoryProps> = ({
  history,
  onClearHistory,
  onOpenGroupUrl,
}) => {
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Filtered history
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch =
        searchTerm === '' ||
        item.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [history, searchTerm, statusFilter]);

  const handleExportCsv = () => {
    const csvData = exportHistoryToCsv(history);
    downloadFile(`ai-group-poster-history-${Date.now()}.csv`, csvData, 'text/csv');
    toast.success('History exported as CSV');
  };

  const handleExportJson = () => {
    const jsonData = JSON.stringify(history, null, 2);
    downloadFile(`ai-group-poster-history-${Date.now()}.json`, jsonData, 'application/json');
    toast.success('History exported as JSON');
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCsv}
            disabled={history.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportJson}
            disabled={history.length === 0}
          >
            Export JSON
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={history.length === 0}
          >
            Clear History
          </Button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredHistory.length}</span> of{' '}
          <span className="text-white font-bold">{history.length}</span> records
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by group name, post title, product..."
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
              <option value="POSTED">Posted</option>
              <option value="SKIPPED">Skipped</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card className="p-0 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-semibold text-slate-200">No Posting History Found</p>
            <p className="text-xs mt-1">
              {history.length === 0
                ? 'Your confirmed group posts and skips will be logged here.'
                : 'No records matched your search or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Target Group</th>
                  <th className="py-3 px-4 font-semibold">Post Title</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Notes / Details</th>
                  <th className="py-3 px-4 font-semibold text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-300">
                      <div>{formatDate(record.postedAt)}</div>
                      <div className="text-[10px] text-slate-500">{formatTime(record.postedAt)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white max-w-[200px] truncate" title={record.groupName}>
                        {record.groupName}
                      </div>
                      <div className="text-[10px] text-slate-500 max-w-[200px] truncate">{record.groupUrl}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold max-w-[200px] truncate" title={record.postTitle}>
                        {record.postTitle}
                      </div>
                      {record.productName && (
                        <div className="text-[10px] text-slate-400">{record.productName}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={record.status}>{record.status}</Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-[240px] truncate" title={record.notes}>
                      {record.notes || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {record.groupUrl && (
                        <button
                          onClick={() => onOpenGroupUrl(record.groupUrl)}
                          title="Open Facebook Group"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1"
                        >
                          <span>Visit</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={async () => {
          await onClearHistory();
          toast.info('Posting history cleared');
          setIsConfirmClearOpen(false);
        }}
        title="Clear Posting History"
        message="Are you sure you want to permanently clear all posting history records? This cannot be undone."
        confirmLabel="Clear History"
      />
    </div>
  );
};
