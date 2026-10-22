import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Play, Pause, ExternalLink, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import { QueueState } from '../../types/queue';
import { UpdateModal } from '../common/UpdateModal';

interface HeaderProps {
  title: string;
  description?: string;
  queueState: QueueState;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onOpenOnboarding: () => void;
  onLoadDemoData: () => void;
  hasGroups: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  queueState,
  onStartQueue,
  onPauseQueue,
  onResumeQueue,
  onOpenOnboarding,
  onLoadDemoData,
  hasGroups,
}) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  return (
    <header className="h-16 px-8 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-white leading-none">{title}</h2>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Demo Mode Button */}
        {!hasGroups && (
          <Button
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} className="text-amber-400" />}
            onClick={onLoadDemoData}
            title="Populate mock groups and post to test immediately"
          >
            Load Demo Data
          </Button>
        )}

        {/* Queue Control Button */}
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
            disabled={!hasGroups}
          >
            Start Queue
          </Button>
        )}

        {/* Facebook Link */}
        <a
          href="https://www.facebook.com/groups/feed/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          <span>Facebook</span>
          <ExternalLink size={12} />
        </a>

        {/* GitHub Update & Reload Button */}
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={13} className="text-indigo-400" />}
          onClick={() => setIsUpdateModalOpen(true)}
          title="Check GitHub Updates & Reload Extension"
        >
          Update
        </Button>

        {/* Help button */}
        <button
          onClick={onOpenOnboarding}
          title="Open Workflow Guide"
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Extension Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </header>
  );
};
