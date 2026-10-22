import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  GitCommit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Terminal,
  ArrowUpCircle,
  Sparkles,
} from 'lucide-react';
import {
  GithubCommitInfo,
  fetchLatestGithubCommit,
  getCurrentCommitSha,
  setCurrentCommitSha,
  pingLocalCompanion,
  requestCompanionUpdate,
  reloadChromeExtension,
} from '../../services/updater/extension-updater';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [latestCommit, setLatestCommit] = useState<GithubCommitInfo | null>(null);
  const [currentSha, setCurrentSha] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [companionActive, setCompanionActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check state when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    try {
      const [savedSha, companionOk] = await Promise.all([
        getCurrentCommitSha(),
        pingLocalCompanion(),
      ]);
      setCurrentSha(savedSha);
      setCompanionActive(companionOk);

      const commit = await fetchLatestGithubCommit();
      if (commit) {
        setLatestCommit(commit);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify update status');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  const hasUpdate = Boolean(
    latestCommit && currentSha && !latestCommit.sha.startsWith(currentSha) && !currentSha.startsWith(latestCommit.sha)
  );

  // 1-Click Update & Reload Handler
  const handleUpdateAndReload = async () => {
    setIsUpdating(true);
    setStatusMessage('Checking update source...');
    setErrorMessage(null);

    try {
      // Step 1: Check if companion server is active
      const companionOk = await pingLocalCompanion();

      if (companionOk) {
        setStatusMessage('Pulling from GitHub & building extension...');
        const res = await requestCompanionUpdate();

        if (!res.success) {
          throw new Error(res.message);
        }

        if (latestCommit?.sha) {
          await setCurrentCommitSha(latestCommit.sha);
        }

        setStatusMessage('Rebuild complete! Reloading extension...');
        if (onShowToast) onShowToast('Extension updated from GitHub & reloading!');

        setTimeout(() => {
          reloadChromeExtension();
        }, 600);
      } else {
        // Step 2: Instant native reload from dist/
        setStatusMessage('Reloading extension into Chrome...');
        if (latestCommit?.sha) {
          await setCurrentCommitSha(latestCommit.sha);
        }
        if (onShowToast) onShowToast('Reloading extension with latest changes...');

        setTimeout(() => {
          reloadChromeExtension();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete update');
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <ArrowUpCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Extension Updater</h3>
              <p className="text-[10px] text-indigo-100">GitHub Sync & Instant Reload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 text-xs max-h-[460px] overflow-y-auto">

          {/* GitHub Status Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <GitCommit size={14} className="text-indigo-500" />
                GitHub Repository
              </span>
              <a
                href="https://github.com/mdnahid7653959-spec/facebook-group-automation"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>main branch</span>
                <ExternalLink size={10} />
              </a>
            </div>

            {isChecking ? (
              <div className="py-2 flex items-center justify-center gap-2 text-slate-400">
                <RefreshCw size={13} className="animate-spin text-indigo-500" />
                <span>Checking latest GitHub commit...</span>
              </div>
            ) : latestCommit ? (
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] leading-snug line-clamp-2">
                  {latestCommit.message}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px] text-slate-700 dark:text-slate-300 font-bold">
                      {latestCommit.shortSha}
                    </span>
                    <span>by {latestCommit.author}</span>
                  </span>
                  <span>{latestCommit.relativeTime}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Could not connect to GitHub. Check internet connection.
              </div>
            )}

            {/* Status Pill */}
            {!isChecking && latestCommit && (
              <div className="pt-1">
                {hasUpdate ? (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>নতুন আপডেট GitHub-এ প্রস্তুত আছে!</span>
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                    <span>আপনার এক্সটেনশনটি GitHub-এর সাথে সিঙ্ক আছে</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local Companion Status */}
          <div className="p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal size={12} className="text-indigo-500" />
                Local Companion Bridge
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                companionActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {companionActive ? 'Active (Auto-Pull On)' : 'Offline (Reload On)'}
              </span>
            </div>

            {companionActive ? (
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                ⚡ লোকাল ব্রিজ চালু আছে। ক্লিক করলেই অটোমেটিক git pull & build হয়ে এক্সটেনশন রিলোড হবে!
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                💡 অটো গিট-পুল চালু করতে আপনার টার্মিনালে <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono font-bold">npm run updater</code> চালান। (না চালালেও <b>Instant Reload</b> কাজ করবে)।
              </p>
            )}
          </div>

          {/* Feedback messages */}
          {statusMessage && (
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2 animate-fadeIn">
              <RefreshCw size={12} className="animate-spin text-blue-500 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={12} className="text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          {/* Check GitHub button */}
          <button
            onClick={loadStatus}
            disabled={isChecking || isUpdating}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Check GitHub for new updates"
          >
            <RefreshCw size={14} className={isChecking ? 'animate-spin text-indigo-500' : ''} />
          </button>

          {/* Main Update & Reload Button */}
          <button
            onClick={handleUpdateAndReload}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Updating & Reloading...</span>
              </>
            ) : companionActive ? (
              <>
                <Sparkles size={14} className="text-yellow-300" />
                <span>1-Click Git Pull & Reload</span>
              </>
            ) : (
              <>
                <Zap size={14} className="text-yellow-300" />
                <span>Instant Reload Extension</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
