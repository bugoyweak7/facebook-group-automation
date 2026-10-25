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
  getAutoJoinState,
  setAutoJoinState,
  getAutoJoinConfig,
  setAutoJoinConfig,
} from '../../services/storage/chrome-storage';
import {
  createQueueItems,
  updateItemStatus,
  recordItemPosted,
  recordItemSkipped,
  findNextExecutableItem,
} from '../../services/queue/queue-engine';

import { getDiscoveryProgress } from '../../services/facebook/discovery-manager';
import { AutoJoinConfig, AutoJoinState, INITIAL_AUTO_JOIN_STATE, DEFAULT_AUTO_JOIN_CONFIG } from '../../types/auto-joiner';
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
  Zap,
  Smile,
  Eye,
  EyeOff,
  Type,
  Tag,
  Minus,
  ListOrdered,
  ListPlus,
  Layers,
  ClipboardPaste,
  Quote,
  FileCode2,
  Copy,
} from 'lucide-react';
import { validateFacebookGroupUrl } from '../../utils/validators';
import { generateId, copyToClipboard } from '../../utils/helpers';
import { aiService } from '../../services/ai/ai-service';
import {
  applyTextStyle,
  applyBulletList,
  applyBold,
  applyItalic,
  applyCustomList,
  applyHeading,
  applyNumberedList,
  applyBlockquote,
  applyStrikethrough,
  applyUnderline,
  autoBeautifyCaption,
  convertToRichHtml,
  htmlToStyledText,
  deduplicateRepeatedCaption,
  FontStyleType,
  ListStyleType,
  DECORATIVE_DIVIDERS,
  EMOJI_CATEGORIES,
  POPULAR_QUICK_EMOJIS,
  SALES_SNIPPETS,
  SalesSnippet,
  DividerItem,
} from '../../utils/text-styler';
import { UpdateModal } from '../../components/common/UpdateModal';
import {
  fetchLatestGithubCommit,
  getCurrentCommitSha,
  checkJustReloaded,
} from '../../services/updater/extension-updater';
import {
  parseBulkGroupText,
  exportGroupsToJson,
  SAMPLE_10_GROUPS_TEXT,
  SAMPLE_20_GROUPS_TEXT,
} from '../../services/groups/bulk-group-importer';

export const PopupApp: React.FC = () => {
  // Navigation views: 'select-groups' | 'compose' | 'posting-queue'
  const [view, setView] = useState<'select-groups' | 'compose' | 'posting-queue'>('select-groups');
  const [activeTab, setActiveTab] = useState<'my-groups' | 'auto-join' | 'import-links'>('my-groups');
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
  const [importCategory, setImportCategory] = useState('Imported');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update System State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [hasGithubUpdate, setHasGithubUpdate] = useState(false);

  // Auto-Joiner State
  const [autoJoinState, setAutoJoinStateObj] = useState<AutoJoinState>(INITIAL_AUTO_JOIN_STATE);
  const [autoJoinUrl, setAutoJoinUrl] = useState('');
  const [autoJoinDelaySec, setAutoJoinDelaySec] = useState<number>(0);
  const [autoJoinMaxGroups, setAutoJoinMaxGroups] = useState<number>(0);
  const [autoJoinQuestions, setAutoJoinQuestions] = useState<boolean>(true);
  const [autoJoinCategory, setAutoJoinCategory] = useState<string>('Auto Joined');
  const [isStartingAutoJoin, setIsStartingAutoJoin] = useState(false);

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
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('all');
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

  const handleApplyBold = () => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => applyBold(prev));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const selected = caption.substring(start, end);
      const isBold = selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4;
      const transformed = isBold ? selected.slice(2, -2) : `**${selected}**`;
      const nextCaption = caption.substring(0, start) + transformed + caption.substring(end);
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      setCaption(before + '****' + after);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
    showToast('𝐁 Bold (**text**)');
  };

  const handleApplyItalic = () => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => applyItalic(prev));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const selected = caption.substring(start, end);
      const isItalic = selected.startsWith('*') && selected.endsWith('*') && selected.length >= 2 && !selected.startsWith('**');
      const transformed = isItalic ? selected.slice(1, -1) : `*${selected}*`;
      const nextCaption = caption.substring(0, start) + transformed + caption.substring(end);
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      setCaption(before + '**' + after);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
    showToast('𝘐 Italic (*text*)');
  };

  const handleApplyHeading = (level: 1 | 2) => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => applyHeading(prev, level));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const heading = applyHeading(selected, level);
      const nextCaption = caption.substring(0, start) + heading + caption.substring(end);
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + heading.length);
      }, 0);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      const lastNewline = before.lastIndexOf('\n');
      const nextNewline = after.indexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const lineEnd = nextNewline === -1 ? caption.length : start + nextNewline;
      const currentLine = caption.substring(lineStart, lineEnd);
      const headingLine = applyHeading(currentLine, level);
      const nextCaption = caption.substring(0, lineStart) + headingLine + caption.substring(lineEnd);
      setCaption(nextCaption);
      showToast(level === 1 ? '🏷️ Heading 1 Applied!' : '🏷️ Heading 2 Applied!');
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

  const handleApplyNumbers = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const numbered = applyNumberedList(selected);
      const nextCaption = caption.substring(0, start) + numbered + caption.substring(end);
      setCaption(nextCaption);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      const nextCaption = before + (before.endsWith('\n') || !before ? '  1. ' : '\n  1. ') + after;
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        const newPos = start + (before.endsWith('\n') || !before ? 5 : 6);
        el.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleApplyQuote = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const quoted = applyBlockquote(selected);
      const nextCaption = caption.substring(0, start) + quoted + caption.substring(end);
      setCaption(nextCaption);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      const nextCaption = before + (before.endsWith('\n') || !before ? '> ' : '\n> ') + after;
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        const newPos = start + (before.endsWith('\n') || !before ? 2 : 3);
        el.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleInsertSnippet = (snippet: SalesSnippet) => {
    const el = textareaRef.current;
    let contentToInsert = snippet.content;
    if (price && contentToInsert.includes('{price}')) {
      contentToInsert = contentToInsert.replace('{price}', `${price} ৳`);
    } else {
      contentToInsert = contentToInsert.replace('{price}', '১,৫০০ ৳');
    }
    if (location && contentToInsert.includes('{location}')) {
      contentToInsert = contentToInsert.replace('{location}', location);
    } else {
      contentToInsert = contentToInsert.replace('{location}', 'ঢাকা');
    }
    if (phone && contentToInsert.includes('{contact_info}')) {
      contentToInsert = contentToInsert.replace('{contact_info}', phone);
    } else {
      contentToInsert = contentToInsert.replace('{contact_info}', 'ইনবক্স করুন / 017xxxxxxxx');
    }

    if (!el) {
      setCaption(prev => prev + '\n' + contentToInsert);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = caption.substring(0, start);
    const after = caption.substring(end);
    const separator = before.length === 0 || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    const nextCaption = before + separator + contentToInsert + '\n' + after;
    setCaption(nextCaption);
    showToast(`Inserted ${snippet.name}!`);
  };

  const handleInsertDivider = (dividerText: string) => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => prev + '\n' + dividerText + '\n');
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = caption.substring(0, start);
    const after = caption.substring(end);
    const separatorBefore = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    const separatorAfter = after.startsWith('\n') ? '' : '\n';
    const nextCaption = before + separatorBefore + dividerText + separatorAfter + after;
    setCaption(nextCaption);
    showToast('Border inserted!');
  };

  const handleInsertEmojiAtCursor = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => prev + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = caption.substring(0, start) + emoji + caption.substring(end);
    setCaption(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const renderInlineFormatted = (content: string): React.ReactNode => {
    if (!content) return '';
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|<u>[^<]+<\/u>|<code>[^<]+<\/code>)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index} className="font-bold text-slate-900 dark:text-white">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index} className="italic text-slate-800 dark:text-slate-200">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('~~') && token.endsWith('~~')) {
        parts.push(<s key={match.index} className="line-through text-slate-400">{token.slice(2, -2)}</s>);
      } else if (token.startsWith('<u>') && token.endsWith('</u>')) {
        parts.push(<u key={match.index} className="underline">{token.slice(3, -4)}</u>);
      } else if (token.startsWith('<code>') && token.endsWith('</code>')) {
        parts.push(<code key={match.index} className="px-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">{token.slice(6, -7)}</code>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    return parts.length > 0 ? parts : content;
  };

  const renderPreviewCaption = (text: string) => {
    if (!text || !text.trim()) {
      return (
        <span className="text-slate-400 italic">No caption entered yet. Type in the editor to see live Facebook styling...</span>
      );
    }
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white pt-1 tracking-tight">
            {renderInlineFormatted(trimmed.replace(/^#\s*/, ''))}
          </h1>
        );
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        return (
          <h2 key={idx} className="text-sm font-bold text-slate-800 dark:text-slate-100 pt-0.5">
            {renderInlineFormatted(trimmed.replace(/^#{2,3}\s*/, ''))}
          </h2>
        );
      }
      if (trimmed.startsWith('> ') || trimmed.startsWith('❝')) {
        return (
          <blockquote key={idx} className="border-l-4 border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 pl-2.5 py-1 text-slate-700 dark:text-slate-200 rounded-r font-medium my-1">
            {renderInlineFormatted(trimmed.replace(/^>\s*/, '').replace(/^[❝❞]\s*/, ''))}
          </blockquote>
        );
      }
      if (/^[•✓✔➤➔★⭐◆❖]/.test(trimmed) || /^[\-*–—]\s+/.test(trimmed)) {
        const marker = trimmed.match(/^([•✓✔➤➔★⭐◆❖\-*–—]+)\s*(.*)$/);
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-2">
            <span className="text-blue-500 font-bold flex-shrink-0">{marker ? marker[1] : '•'}</span>
            <span>{renderInlineFormatted(marker ? marker[2] : trimmed)}</span>
          </div>
        );
      }
      if (/^(\d+)[\.\)]\s+/.test(trimmed)) {
        const marker = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] flex-shrink-0">{marker ? `${marker[1]}.` : '1.'}</span>
            <span>{renderInlineFormatted(marker ? marker[2] : trimmed)}</span>
          </div>
        );
      }
      if (/^[═━─✦✿▀▄┈•=—\-*~]{8,}/.test(trimmed)) {
        return (
          <div key={idx} className="font-mono text-slate-400 dark:text-slate-500 text-[10px] py-0.5 select-none tracking-tight">
            {line}
          </div>
        );
      }
      return (
        <div key={idx} className="whitespace-pre-wrap">
          {renderInlineFormatted(line)}
        </div>
      );
    });
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

    const hasRichHtml = Boolean(
      htmlData &&
      (/<(h[1-6]|ul|ol|li|blockquote|strong|b|em|i|s|del|strike|u|code)[\s>]/i.test(htmlData) ||
        htmlData.includes('data-lexical') ||
        htmlData.includes('font-weight') ||
        htmlData.includes('font-style') ||
        htmlData.includes('text-decoration'))
    );

    if (hasRichHtml) {
      let styled = htmlToStyledText(htmlData, { preferMarkdown: true });
      styled = deduplicateRepeatedCaption(styled);
      if (styled && styled.trim().length > 0) {
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
        showToast('✨ Pasted with exact design preserved!');
        return;
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
    const [acc, g, p, q, qs, dp, ajState, ajConfig] = await Promise.all([
      getFacebookAccount(),
      getGroups(),
      getPosts(),
      getQueue(),
      getQueueState(),
      getDiscoveryProgress(),
      getAutoJoinState(),
      getAutoJoinConfig(),
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

    if (ajState) {
      setAutoJoinStateObj(ajState);
    }
    if (ajConfig?.searchUrl && !autoJoinUrl) {
      setAutoJoinUrl(ajConfig.searchUrl);
    }

    // Initialize selected IDs from stored selected state if empty
    setSelectedIdsOrder(prev => {
      if (prev.length === 0) {
        return cleanedGroups.filter(item => item.selected).map(item => item.id);
      }
      return prev.filter(id => cleanedGroups.some(item => item.id === id));
    });
  }, [autoJoinUrl]);

  const handleDeleteGroup = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteGroup(id);
    setSelectedIdsOrder(prev => prev.filter(item => item !== id));
    await loadData();
    showToast('Removed from list');
  };

  const handleStartAutoJoin = async () => {
    if (!autoJoinUrl.trim()) {
      showToast('Please enter a Facebook search link or keyword');
      return;
    }

    setIsStartingAutoJoin(true);
    const config: AutoJoinConfig = {
      searchUrl: autoJoinUrl.trim(),
      delaySec: autoJoinDelaySec,
      maxGroups: autoJoinMaxGroups,
      autoAnswerQuestions: autoJoinQuestions,
      defaultAnswer: 'Yes, I agree to the group rules and guidelines.',
      saveToGroups: true,
      selectedCategory: autoJoinCategory.trim() || 'Auto Joined',
    };

    try {
      await setAutoJoinConfig(config);
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          {
            type: 'START_AUTO_JOIN',
            payload: config,
          },
          (res) => {
            setIsStartingAutoJoin(false);
            if (chrome.runtime.lastError) {
              showToast('Error: ' + chrome.runtime.lastError.message);
            } else {
              showToast('Auto-Join started! Opening Facebook search...');
            }
          }
        );
      } else {
        setIsStartingAutoJoin(false);
        showToast('Auto-Join triggered');
      }
    } catch (e: any) {
      setIsStartingAutoJoin(false);
      showToast('Error: ' + (e?.message || String(e)));
    }
  };

  const handlePauseAutoJoin = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'PAUSE_AUTO_JOIN' });
    }
    setAutoJoinStateObj(prev => ({ ...prev, status: 'PAUSED' }));
  };

  const handleResumeAutoJoin = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'RESUME_AUTO_JOIN' });
    }
    setAutoJoinStateObj(prev => ({ ...prev, status: 'JOINING' }));
  };

  const handleStopAutoJoin = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'STOP_AUTO_JOIN' });
    }
    setAutoJoinStateObj(prev => ({ ...prev, status: 'STOPPED' }));
    showToast('Auto-join stopped');
  };

  const focusFacebookTab = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });
      const target = tabs.find(t => t.url && t.url.includes('/search')) || tabs[0];
      if (target?.id) {
        await chrome.tabs.update(target.id, { active: true });
        if (target.windowId) {
          try { await chrome.windows.update(target.windowId, { focused: true }); } catch (_) {}
        }
      }
    }
  };

  useEffect(() => {
    checkJustReloaded().then(justReloaded => {
      if (justReloaded) {
        showToast('✨ Extension reloaded & updated successfully!');
      }
    });

    fetchLatestGithubCommit().then(async commit => {
      if (commit) {
        const curSha = await getCurrentCommitSha();
        if (curSha && !commit.sha.startsWith(curSha) && !curSha.startsWith(commit.sha)) {
          setHasGithubUpdate(true);
        }
      }
    }).catch(() => {});

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
          } else if (message?.type === 'AUTO_JOIN_PROGRESS') {
            if (message.payload) {
              setAutoJoinStateObj(message.payload);
            }
          } else if (message?.type === 'AUTO_JOIN_SAVE_GROUPS') {
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
      if (storageListener && typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(storageListener);
      }
      if (messageListener && typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
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

  // Quick Select 10 / 20 groups
  const handleSelectBatch = async (count: number) => {
    const targetGroups = filteredGroups.slice(0, count);
    const targetIds = targetGroups.map(g => g.id);
    setSelectedIdsOrder(targetIds);

    const updatedGroups = groups.map(g => ({
      ...g,
      selected: targetIds.includes(g.id),
      updatedAt: Date.now(),
    }));
    await setGroups(updatedGroups);
    setGroupsState(updatedGroups);
    showToast(`Selected first ${targetIds.length} groups`);
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
    if (!importText.trim()) {
      showToast('Enter Facebook group URLs, IDs, or paste JSON');
      return;
    }

    const summary = parseBulkGroupText(importText, groups, importCategory, 'PUBLIC', true);
    if (summary.groupsToCreate.length === 0) {
      if (summary.duplicateItems.length > 0) {
        showToast(`All ${summary.duplicateItems.length} group(s) already exist in your saved groups`);
      } else {
        showToast('No valid group URLs or IDs found in the pasted text');
      }
      return;
    }

    const updated = [...summary.groupsToCreate, ...groups];
    await setGroups(updated);
    setGroupsState(updated);
    const newIds = summary.groupsToCreate.map(g => g.id);
    setSelectedIdsOrder(prev => [...newIds, ...prev]);
    setImportText('');
    setActiveTab('my-groups');
    showToast(`Imported ${summary.groupsToCreate.length} group(s)!`);
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
      const result = await aiService.generateCaption({
        productName: title || 'Product',
        productDetails: caption || title,
        currentCaption: caption,
        style: 'Sales',
        language: 'Bangla',
      });
      if (result && result.success && result.content) {
        setCaption(result.content);
        showToast('Caption polished with AI!');
      } else {
        showToast(result?.error || 'Could not polish caption');
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
        enabled: true,
        status: 'READY' as const,
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

              {/* GitHub Update & Reload Button (Circled in user screenshot) */}
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="relative flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs active:scale-95"
                title="GitHub Update & Extension Reload"
              >
                <RefreshCw size={11} className={hasGithubUpdate ? 'animate-spin text-indigo-500' : 'text-indigo-500'} />
                <span>Update</span>
                {hasGithubUpdate && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
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
                type="button"
                onClick={async () => {
                  if (groups.length === 0) {
                    showToast('No groups to copy');
                    return;
                  }
                  const json = exportGroupsToJson(groups, account?.name);
                  if (await copyToClipboard(json)) {
                    showToast(`Copied ${groups.length} groups JSON!`);
                  }
                }}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-semibold transition-colors"
                title="Copy all groups JSON to paste on another device"
              >
                <FileCode2 size={13} />
                <span>Copy JSON</span>
              </button>

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
              onClick={() => setActiveTab('auto-join')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'auto-join'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap size={14} className={autoJoinState.status === 'JOINING' ? 'text-emerald-500 animate-bounce' : ''} />
              <span>Auto-Join</span>
              {autoJoinState.status === 'JOINING' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('import-links')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'import-links'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ListPlus size={14} />
              <span>Bulk Add (10/20+)</span>
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

                  {/* Controls Row: Select All | 10 | 20 | Clear All */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      <button onClick={handleSelectAll} className="hover:underline">
                        All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button onClick={() => handleSelectBatch(10)} className="hover:underline" title="Select first 10 groups">
                        10
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button onClick={() => handleSelectBatch(20)} className="hover:underline" title="Select first 20 groups">
                        20
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button onClick={handleClearAll} className="hover:underline text-slate-500 dark:text-slate-400">
                        Clear
                      </button>
                    </div>

                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Selected {selectedCount}/{groups.length}
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

          {/* Tab 2: Auto-Join Groups Content */}
          {activeTab === 'auto-join' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {/* Header Info */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                    ⚡
                  </div>
                  <span>Facebook Search & Auto-Joiner</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ফেসবুক গ্রুপ সার্চ লিংক দিন — সরাসরি চোখের সামনে প্রতিটা গ্রুপে জয়েন করবে ও লিস্টে সেভ করবে যাতে পরবর্তীতে পোস্ট করতে পারেন।
                </p>
              </div>

              {/* Search URL / Keyword Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Facebook Group Search Link or Keyword</span>
                  {autoJoinUrl && (
                    <button
                      type="button"
                      onClick={() => setAutoJoinUrl('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={autoJoinUrl}
                    onChange={e => setAutoJoinUrl(e.target.value)}
                    placeholder="https://www.facebook.com/search/groups/?q=shoes or keyword"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Search Chips */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quick Suggestions:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Buy & Sell', q: 'buy and sell' },
                    { label: 'Marketplace', q: 'marketplace dhaka' },
                    { label: 'Fashion / Clothes', q: 'clothing wholesale' },
                    { label: 'Business / Freelance', q: 'freelancers bangladesh' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setAutoJoinUrl(`https://www.facebook.com/search/groups/?q=${encodeURIComponent(chip.q)}`)}
                      className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 px-2 py-1 rounded-md transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Configuration Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2.5 text-xs">
                {/* Delay & Max Groups Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Safe Delay Between Joins
                    </label>
                    <select
                      value={autoJoinDelaySec}
                      onChange={e => setAutoJoinDelaySec(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value={0}>⚡ 0s (Zero Wait / সাথে সাথে)</option>
                      <option value={1}>🚀 1s (Fast)</option>
                      <option value={2}>⚡ 2s (Safe)</option>
                      <option value={4}>🛡️ 4s (Normal)</option>
                      <option value={6}>🔒 6s (Strict)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Max Groups Limit
                    </label>
                    <select
                      value={autoJoinMaxGroups}
                      onChange={e => setAutoJoinMaxGroups(Number(e.target.value))}
                      className="w-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={0}>All Available (No Limit)</option>
                      <option value={10}>10 Groups</option>
                      <option value={20}>20 Groups</option>
                      <option value={50}>50 Groups</option>
                    </select>
                  </div>
                </div>

                {/* Auto-answer questions & agree to rules */}
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-[11px] pt-1">
                  <input
                    type="checkbox"
                    checked={autoJoinQuestions}
                    onChange={e => setAutoJoinQuestions(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 dark:border-slate-600 focus:ring-0"
                  />
                  <span>Auto-agree to group rules & answer questions</span>
                </label>
              </div>

              {/* Live Status HUD Card (if Auto-Join is active) */}
              {(autoJoinState.status === 'JOINING' || autoJoinState.status === 'SEARCHING' || autoJoinState.status === 'PAUSED') && (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 border border-emerald-500/30 shadow-md">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Auto-Join Active ({autoJoinState.status})
                    </span>
                    <button
                      type="button"
                      onClick={focusFacebookTab}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold flex items-center gap-1"
                    >
                      <span>View Tab</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>

                  {/* 4-Stat Grid */}
                  <div className="grid grid-cols-4 gap-1 text-center py-1 bg-slate-800/80 rounded-lg border border-slate-700/50">
                    <div>
                      <div className="text-sm font-black text-blue-400">{autoJoinState.totalFound}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Found</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-emerald-400">{autoJoinState.joinedCount}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Joined</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-amber-400">{autoJoinState.requestedCount}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Pending</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-purple-400">{autoJoinState.alreadyJoinedCount}</div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Member</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 truncate">
                    {autoJoinState.message || 'Processing groups...'}
                  </div>

                  {/* Pause / Resume / Stop Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {autoJoinState.status === 'PAUSED' ? (
                      <button
                        type="button"
                        onClick={handleResumeAutoJoin}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Play size={12} />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePauseAutoJoin}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Pause size={12} />
                        <span>Pause</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStopAutoJoin}
                      className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <StopCircle size={12} />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Action Button */}
              <button
                type="button"
                onClick={handleStartAutoJoin}
                disabled={isStartingAutoJoin}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap size={14} className={isStartingAutoJoin ? 'animate-spin' : ''} />
                <span>
                  {isStartingAutoJoin
                    ? 'Launching Auto-Joiner...'
                    : autoJoinState.status === 'JOINING'
                    ? 'Restart Auto-Join on Search Link'
                    : 'Start Auto-Joining in Facebook (ফেসবুকে অটো জয়েন করুন)'}
                </span>
              </button>

              {/* Jump to My Groups */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-groups')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Go to My Groups to select & post ({groups.length} groups saved) →
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Bulk Add (10/20+) Content */}
          {activeTab === 'import-links' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              {/* Presets Bar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setImportText(SAMPLE_10_GROUPS_TEXT)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all active:scale-95"
                  >
                    +10 Groups
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportText(SAMPLE_20_GROUPS_TEXT)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 transition-all active:scale-95"
                  >
                    +20 Groups
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text?.trim()) {
                        setImportText(prev => (prev.trim() ? prev + '\n' + text.trim() : text.trim()));
                        showToast('Pasted from clipboard!');
                      }
                    } catch {
                      showToast('Could not access clipboard');
                    }
                  }}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1"
                >
                  <ClipboardPaste size={11} />
                  <span>Paste</span>
                </button>

                {groups.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      const json = exportGroupsToJson(groups, account?.name);
                      if (await copyToClipboard(json)) {
                        showToast(`Copied ${groups.length} groups JSON!`);
                      }
                    }}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 transition-all flex items-center gap-1 active:scale-95"
                    title="Copy current groups as JSON for other devices"
                  >
                    <Copy size={11} />
                    <span>Copy JSON</span>
                  </button>
                )}
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste Facebook group links, or paste JSON code from another device:&#10;https://www.facebook.com/groups/dhakasell/&#10;or [ { &quot;name&quot;: &quot;...&quot;, &quot;url&quot;: &quot;...&quot; } ]"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
              />

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">Category:</span>
                <input
                  type="text"
                  value={importCategory}
                  onChange={e => setImportCategory(e.target.value)}
                  placeholder="Category"
                  className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleImportLinks}
                disabled={!importText.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <ListPlus size={14} />
                <span>Bulk Import Groups</span>
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                title="GitHub Update & Reload Extension"
              >
                <RefreshCw size={10} className={hasGithubUpdate ? 'animate-spin text-indigo-500' : ''} />
                <span>Update</span>
              </button>
              <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {selectedCount} Target
              </span>
            </div>
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
              <div className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl text-[11px] space-y-1.5">
                {/* Row 1: Facebook Text Formatting Tools */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyHeading(1)}
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-800 dark:text-slate-100 text-xs"
                    title="Heading 1 (বড় শিরোনাম - H1)"
                  >
                    H1
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyHeading(2)}
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-800 dark:text-slate-100 text-xs"
                    title="Heading 2 (মাঝারি শিরোনাম - H2)"
                  >
                    H2
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyBold}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-800 dark:text-slate-100"
                    title="Bold font (**text** - Works for Bengali, English, Emojis)"
                  >
                    <span className="font-bold">𝐁</span> Bold
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyItalic}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-800 dark:text-slate-100"
                    title="Italic font (*text*)"
                  >
                    <span className="italic font-serif">𝘐</span> Italic
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyStyle('strikethrough')}
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-mono font-bold text-slate-700 dark:text-slate-200 line-through"
                    title="Strikethrough / কাটা দাগ (মূল্য ছাড়ে: ̶২̶,̶৫̶০̶০̶ ৳)"
                  >
                    S
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyBullets}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200 flex items-center gap-0.5"
                    title="Bullet list (বুলেট পয়েন্ট)"
                  >
                    <span className="text-blue-500">•</span> Bullets
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyNumbers}
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200"
                    title="Numbered list (১, ২, ৩ নাম্বারিং)"
                  >
                    1. List
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyQuote}
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded font-bold text-slate-700 dark:text-slate-200"
                    title="Blockquote (কোটেশন বক্স)"
                  >
                    ❞ Quote
                  </button>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyStyle(e.target.value as FontStyleType);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                    title="More Unicode Font Styles"
                  >
                    <option value="" disabled>🔤 Style</option>
                    <option value="sans-bold">𝘀𝗮𝗹𝗲 (Sans Bold)</option>
                    <option value="sans-italic">𝘴𝘢𝘭𝘦 (Sans Italic)</option>
                    <option value="sans-bold-italic">𝙨𝙖𝙡𝙚 (Bold Italic)</option>
                    <option value="serif-bold">𝐬𝐚ｌｅ (Serif Bold)</option>
                    <option value="serif-italic">𝑠𝑎𝑙𝑒 (Serif Italic)</option>
                    <option value="script">𝓈𝒶𝓁ℯ (Cursive Script)</option>
                    <option value="bold-script">𝓼𝓪𝓵𝓮 (Bold Script)</option>
                    <option value="fraktur">𝔰𝔞𝔩𝔢 (Gothic Fraktur)</option>
                    <option value="bold-fraktur">𝖌𝖔𝖙𝖍𝖎𝖈 (Bold Gothic)</option>
                    <option value="double-struck">𝕕𝕠𝕦𝕓𝕝𝕖 (Double Struck)</option>
                    <option value="bubble">ⓑⓤⓑⓑⓛⓔ (Bubble)</option>
                    <option value="bubble-black">🅑🅤🅑🅑🅛🅔 (Black Bubble)</option>
                    <option value="square">🅂🅀🅄🄰🅁🄴 (Square)</option>
                    <option value="square-black">🅰🅱🅲 (Black Square)</option>
                    <option value="small-caps">ѕᴍᴀʟʟ ᴄᴀᴘs (Small Caps)</option>
                    <option value="monospace">𝚜𝚊𝚕𝚎 (Monospace)</option>
                    <option value="normal">sale (Clear Style)</option>
                  </select>
                </div>

                {/* Row 2: Sales Tags, Dividers, Auto-Design & Live Preview */}
                <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={handleAutoBeautify}
                      className="px-2 py-0.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 rounded flex items-center gap-1 transition-all"
                      title="১-ক্লিকে অটো-ডিজাইন (Italic Title, Spec Bullets & Condition Notes)"
                    >
                      <Sparkles size={11} />
                      <span>✨ Auto-Design</span>
                    </button>

                    {/* Sales Snippets Dropdown */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const snip = SALES_SNIPPETS.find(s => s.id === e.target.value);
                          if (snip) handleInsertSnippet(snip);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold"
                      title="Insert Sales Elements (Price, Delivery, WhatsApp, Warranty)"
                    >
                      <option value="" disabled>🏷️ 1-Click Sales Tags</option>
                      {SALES_SNIPPETS.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>

                    {/* Borders Dropdown */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleInsertDivider(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-700 dark:text-slate-300"
                      title="Insert Decorative Divider Lines"
                    >
                      <option value="" disabled>➖ Borders</option>
                      {DECORATIVE_DIVIDERS.map(d => (
                        <option key={d.name} value={d.value}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live FB Preview Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(prev => !prev)}
                    className={`px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1 transition-all ${
                      showLivePreview
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:border-blue-400'
                    }`}
                    title="Toggle Live Facebook Post Preview"
                  >
                    {showLivePreview ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showLivePreview ? 'Edit Text' : '👁️ FB Preview'}</span>
                  </button>
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

              {/* View Mode: Live FB Preview OR Main Textarea */}
              {showLivePreview ? (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-b-xl border-t-0 space-y-2.5 animate-fadeIn shadow-inner">
                  {/* Mock Facebook Post Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {account?.name ? account.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <span>{account?.name || 'Your Profile'}</span>
                          <span className="text-slate-400 font-normal">▶</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold truncate max-w-[150px]">
                            {selectedCount > 0 ? (groups.find(g => selectedIdsOrder.includes(g.id))?.name || 'Facebook Group') : 'Target Group'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <span>Just now</span>
                          <span>·</span>
                          <span>Public group</span>
                          <span>·</span>
                          <span>🌐</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(false)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      ✎ Edit Post
                    </button>
                  </div>

                  {/* Rendered Live Styled Caption */}
                  <div className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed max-h-[180px] overflow-y-auto space-y-1 p-1">
                    {renderPreviewCaption(caption)}
                  </div>

                  {/* Rendered Attached Media Grid */}
                  {images.length > 0 && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                      {images.length === 1 && (
                        <img src={images[0]} alt="Post media" className="w-full h-36 object-cover" />
                      )}
                      {images.length === 2 && (
                        <div className="grid grid-cols-2 gap-1">
                          <img src={images[0]} alt="Media 1" className="w-full h-28 object-cover" />
                          <img src={images[1]} alt="Media 2" className="w-full h-28 object-cover" />
                        </div>
                      )}
                      {images.length >= 3 && (
                        <div className="grid grid-cols-3 gap-1">
                          <img src={images[0]} alt="Media 1" className="w-full h-24 object-cover" />
                          <img src={images[1]} alt="Media 2" className="w-full h-24 object-cover" />
                          <div className="relative">
                            <img src={images[2]} alt="Media 3" className="w-full h-24 object-cover" />
                            {images.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 text-white font-bold text-sm flex items-center justify-center">
                                +{images.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mock Facebook Engagement Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                    <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <span>👍</span> Like
                    </div>
                    <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <span>💬</span> Comment
                    </div>
                    <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                      <span>↗️</span> Share
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  rows={5}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  onPaste={handlePasteCaption}
                  placeholder="What are you posting? Write your full listing caption, details, price, phone number...&#10;&#10;Use H1, H2, Bold, Italic, Bullets, Sales Tags above to design your caption!"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-b-xl rounded-t-none border-t-0 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                />
              )}

              {/* Row 3: Quick Clickable Emojis Strip & More Button */}
              <div className="flex items-center justify-between gap-1 py-0.5 text-xs">
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 flex-1 no-scrollbar">
                  {POPULAR_QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmojiAtCursor(emoji)}
                      className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-transform active:scale-125 text-sm"
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                  className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded text-[11px] font-bold flex items-center gap-1 shrink-0 ml-1 transition-colors"
                  title="More categorized Facebook emojis"
                >
                  <Smile size={12} />
                  <span>More...</span>
                </button>
              </div>

              {/* Categorized Emojis Modal / Popover */}
              {isEmojiPickerOpen && (
                <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 shadow-lg animate-fadeIn text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      <span>😀</span> Facebook Sales Emojis
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Search Emojis */}
                  <input
                    type="text"
                    value={emojiSearchTerm}
                    onChange={e => setEmojiSearchTerm(e.target.value)}
                    placeholder="Search emoji (e.g. fire, money, phone)..."
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedEmojiCategory('all')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
                        selectedEmojiCategory === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    {EMOJI_CATEGORIES.map(cat => (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setSelectedEmojiCategory(cat.category)}
                        className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                          selectedEmojiCategory === cat.category
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.category.split(' ')[0]} {cat.category.split(' ')[1]}
                      </button>
                    ))}
                  </div>

                  {/* Emoji Grid */}
                  <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                    {EMOJI_CATEGORIES.filter(cat => selectedEmojiCategory === 'all' || selectedEmojiCategory === cat.category).map(cat => {
                      const filteredEmojis = cat.emojis.filter(e => !emojiSearchTerm.trim() || e.includes(emojiSearchTerm) || cat.category.toLowerCase().includes(emojiSearchTerm.toLowerCase()));
                      if (filteredEmojis.length === 0) return null;
                      return (
                        <div key={cat.category} className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {cat.category}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {filteredEmojis.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  handleInsertEmojiAtCursor(emoji);
                                  showToast(`Inserted ${emoji}`);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-base transition-transform active:scale-125"
                                title={`Insert ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                title="GitHub Update & Reload Extension"
              >
                <RefreshCw size={10} className={hasGithubUpdate ? 'animate-spin text-indigo-500' : ''} />
                <span>Update</span>
              </button>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                {queueState.isRunning ? 'Active' : 'Finished'}
              </span>
            </div>
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

      {/* Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onShowToast={showToast}
      />

    </div>
  );
};
