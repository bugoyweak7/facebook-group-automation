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
  ChevronDown,
  ChevronUp,
  FileCode2,
} from 'lucide-react';
import {
  GithubCommitInfo,
  CompanionStatusResponse,
  fetchLatestGithubCommit,
  getCurrentCommitSha,
  setCurrentCommitSha,
  pingLocalCompanion,
  getCompanionStatus,
  requestCompanionUpdate,
  requestCompanionRebuild,
  reloadChromeExtension,
  isCommitUpToDate,
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
  const [companionStatus, setCompanionStatus] = useState<CompanionStatusResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Check state when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setLogs(null);

    try {
      const [savedSha, companionOk] = await Promise.all([
        getCurrentCommitSha(),
        pingLocalCompanion(),
      ]);
      setCurrentSha(savedSha);
      setCompanionActive(companionOk);

      if (companionOk) {
        const compDetails = await getCompanionStatus();
        setCompanionStatus(compDetails);
        if (compDetails?.commit?.sha) {
          setCurrentSha(compDetails.commit.sha);
          await setCurrentCommitSha(compDetails.commit.sha);
        }
      }

      const commit = await fetchLatestGithubCommit();
      if (commit) {
        setLatestCommit(commit);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'আপডেট স্ট্যাটাস চেক করতে সমস্যা হয়েছে');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  // True comparison between current Sha and latest remote GitHub commit
  const hasUpdate = Boolean(
    latestCommit && currentSha && !isCommitUpToDate(currentSha, latestCommit.sha)
  );

  const displayShortSha = currentSha ? currentSha.substring(0, 7) : '33b84ad';

  // 1-Click Update from GitHub via Local Companion
  const handleUpdateFromGitHub = async () => {
    setIsUpdating(true);
    setStatusMessage('📡 GitHub থেকে লেটেস্ট কোড আনা হচ্ছে (git pull origin main)...');
    setErrorMessage(null);
    setLogs(null);

    try {
      const res = await requestCompanionUpdate();

      if (!res.success) {
        setLogs(`[Pull Output]\n${res.pullOutput || 'No output'}\n\n[Build Output]\n${res.buildOutput || 'No output'}`);
        setShowLogs(true);
        throw new Error(res.message || 'GitHub থেকে আপডেট বা বিল্ড ব্যর্থ হয়েছে');
      }

      const newSha = res.commit?.sha || latestCommit?.sha || currentSha;
      await setCurrentCommitSha(newSha);
      setCurrentSha(newSha);

      setStatusMessage('✨ সফলভাবে আপডেট সম্পন্ন! এক্সটেনশন রিলোড হচ্ছে...');
      if (onShowToast) onShowToast('✨ এক্সটেনশন সফলভাবে আপডেট হয়েছে!');

      setTimeout(() => {
        reloadChromeExtension();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'আপডেট প্রক্রিয়া সম্পন্ন করা যায়নি');
      setIsUpdating(false);
    }
  };

  // Rebuild local files & reload into Chrome
  const handleRebuildAndReload = async () => {
    setIsUpdating(true);
    setStatusMessage('🔨 লোকাল কোড রি-বিল্ড করা হচ্ছে (npm run build)...');
    setErrorMessage(null);

    try {
      if (companionActive) {
        const res = await requestCompanionRebuild();
        if (!res.success) {
          setLogs(res.buildOutput || 'Build output not captured');
          setShowLogs(true);
          throw new Error(res.message || 'বিল্ড সম্পন্ন হতে পারেনি');
        }
        if (res.commit?.sha) {
          await setCurrentCommitSha(res.commit.sha);
        }
      }

      setStatusMessage('✨ রিলোড হচ্ছে...');
      if (onShowToast) onShowToast('এক্সটেনশন রি-বিল্ড ও রিলোড সম্পন্ন!');

      setTimeout(() => {
        reloadChromeExtension();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'বিল্ড ব্যর্থ হয়েছে');
      setIsUpdating(false);
    }
  };

  // Direct native reload (without build)
  const handleDirectReload = () => {
    setStatusMessage('🔄 এক্সটেনশন সরাসরি রিলোড হচ্ছে...');
    if (onShowToast) onShowToast('এক্সটেনশন রিলোড হচ্ছে...');
    setTimeout(() => {
      reloadChromeExtension();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-[390px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <ArrowUpCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Extension Updater</h3>
              <p className="text-[10px] text-indigo-100">GitHub Sync & 1-Click Reload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 text-xs max-h-[490px] overflow-y-auto">

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
              <div className="py-2.5 flex items-center justify-center gap-2 text-slate-400">
                <RefreshCw size={13} className="animate-spin text-indigo-500" />
                <span>GitHub স্ট্যাটাস যাচাই করা হচ্ছে...</span>
              </div>
            ) : latestCommit ? (
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] leading-snug line-clamp-2">
                  {latestCommit.message}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1.5">
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
                GitHub-এর সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।
              </div>
            )}

            {/* Sync Status Badge */}
            {!isChecking && latestCommit && (
              <div className="pt-1">
                {hasUpdate ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div>নতুন আপডেট GitHub-এ প্রস্তুত আছে!</div>
                      <div className="text-[9px] font-normal text-emerald-600 dark:text-emerald-400">
                        লোকাল: {displayShortSha} ➔ গিটহাব: {latestCommit.shortSha}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold">এক্সটেনশন সম্পূর্ণ আপ-টু-ডেট</span>
                    </div>
                    <span className="font-mono text-[9px] bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-bold">
                      {displayShortSha}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local Companion Bridge Card */}
          <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal size={13} className="text-indigo-500" />
                Local Companion Bridge
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                companionActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}>
                {companionActive ? 'Active (Auto-Pull On)' : 'Offline (Companion Not Running)'}
              </span>
            </div>

            {companionActive ? (
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                ⚡ লোকাল অটো-আপডেট ইঞ্জিন চালু আছে (Port 3959)। ক্লিক করলেই স্বয়ংক্রিয়ভাবে git pull ও npm run build হয়ে এক্সটেনশন রিলোড হয়ে যাবে!
              </p>
            ) : (
              <div className="space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                <p className="leading-snug">
                  💡 সম্পূর্ণ অটোমেটিক আপডেটের জন্য প্রোজেক্ট ফোল্ডারে থাকা <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono font-bold">start-updater.bat</code> ফাইলটি রান করুন।
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={loadStatus}
                    disabled={isChecking}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw size={10} className={isChecking ? 'animate-spin' : ''} />
                    <span>কানেকশন আবার চেক করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Progress message */}
          {statusMessage && (
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2 animate-fadeIn font-medium">
              <RefreshCw size={13} className="animate-spin text-blue-500 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{errorMessage}</div>
                {logs && (
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="mt-1 text-[10px] underline flex items-center gap-1 text-rose-600 dark:text-rose-400 cursor-pointer"
                  >
                    <span>{showLogs ? 'লগ লুকান' : 'বিস্তারিত লগ দেখুন'}</span>
                    {showLogs ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Collapsible Log Output */}
          {showLogs && logs && (
            <div className="p-2.5 bg-slate-900 rounded-lg text-slate-200 font-mono text-[9px] max-h-36 overflow-y-auto space-y-1">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] border-b border-slate-800 pb-1 font-bold">
                <FileCode2 size={11} />
                <span>Diagnostics Log:</span>
              </div>
              <pre className="whitespace-pre-wrap">{logs}</pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Refresh GitHub Status button */}
            <button
              onClick={loadStatus}
              disabled={isChecking || isUpdating}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="GitHub এবং লোকাল ব্রিজ রিফ্রেশ করুন"
            >
              <RefreshCw size={14} className={isChecking ? 'animate-spin text-indigo-500' : ''} />
            </button>

            {/* Main Action Button */}
            {companionActive ? (
              <button
                onClick={hasUpdate ? handleUpdateFromGitHub : handleRebuildAndReload}
                disabled={isUpdating}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 ${
                  hasUpdate
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/20'
                }`}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>আপডেট ও রি-বিল্ড হচ্ছে...</span>
                  </>
                ) : hasUpdate ? (
                  <>
                    <Sparkles size={14} className="text-yellow-300" />
                    <span>1-Click Git Pull & Update</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} className="text-yellow-300" />
                    <span>Rebuild & Reload Local Extension</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDirectReload}
                disabled={isUpdating}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap size={14} className="text-yellow-300" />
                <span>Instant Reload Extension</span>
              </button>
            )}
          </div>

          {/* Secondary fallback when companion is active but already up to date */}
          {companionActive && !hasUpdate && (
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span>কোড সম্পূর্ণ আপ-টু-ডেট আছে</span>
              <button
                onClick={handleUpdateFromGitHub}
                disabled={isUpdating}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Force Pull from GitHub
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
