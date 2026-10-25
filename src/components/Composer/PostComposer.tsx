import React, { useState, useEffect, useRef } from 'react';
import { Post, PostTemplate } from '../../types/post';
import { Group } from '../../types/group';
import { AppSettings } from '../../types/settings';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCode2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  UploadCloud,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Users,
  Smile,
  Search,
  Shuffle,
  Tag,
  Minus,
  RotateCcw,
  Layout,
  Type,
  List,
} from 'lucide-react';
import { generateId, copyToClipboard } from '../../utils/helpers';
import { formatPostWithTemplate } from '../../services/template/template-engine';
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
  htmlToStyledText,
  resolveSpintax,
  deduplicateRepeatedCaption,
  FontStyleType,
  ListStyleType,
  DECORATIVE_DIVIDERS,
  EMOJI_CATEGORIES,
  POPULAR_QUICK_EMOJIS,
  SALES_SNIPPETS,
  CAPTION_PRESETS,
  CaptionPreset,
  SalesSnippet,
} from '../../utils/text-styler';
import { aiService } from '../../services/ai/ai-service';
import { useToast } from '../common/Toast';
import { TabType } from '../layout/Sidebar';
import { SelectGroupsModal } from '../Groups/SelectGroupsModal';

interface PostComposerProps {
  posts: Post[];
  templates: PostTemplate[];
  groups: Group[];
  selectedGroupIds: string[];
  activePostId?: string;
  settings?: AppSettings;
  onSavePost: (post: Post) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onSaveGroups?: (groups: Group[]) => Promise<void>;
  onCreateQueue: (groupIds: string[], postId: string) => Promise<void>;
  onNavigateTab: (tab: TabType) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  posts,
  templates,
  groups,
  selectedGroupIds,
  activePostId,
  settings,
  onSavePost,
  onDeletePost,
  onSaveGroups,
  onCreateQueue,
  onNavigateTab,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedPostId, setSelectedPostId] = useState<string>(
    activePostId || (posts.length > 0 ? posts[0].id : '')
  );

  // Core Composer Fields
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Optional listing metadata fields
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [templateId, setTemplateId] = useState<string>('');

  // Select Groups Modal state
  const [isSelectGroupsModalOpen, setIsSelectGroupsModalOpen] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedGroupIds);

  useEffect(() => {
    setLocalSelectedIds(selectedGroupIds);
  }, [selectedGroupIds]);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiProductDetails, setAiProductDetails] = useState('');
  const [aiStyle, setAiStyle] = useState<'Sales' | 'Marketplace' | 'Friendly' | 'Professional' | 'Short'>('Sales');
  const [aiLanguage, setAiLanguage] = useState<'Bangla' | 'Banglish' | 'English'>('Bangla');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Design Studio Modals & Tools
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('ALL');
  const [isEmojisModalOpen, setIsEmojisModalOpen] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<number>(0);
  const [emojiSearch, setEmojiSearch] = useState<string>('');

  // Find & Replace
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // Spintax Helper & Live Test
  const [isSpintaxModalOpen, setIsSpintaxModalOpen] = useState(false);
  const [spintaxOptionsInput, setSpintaxOptionsInput] = useState('অফার ১ | সেরা ডিল | ধামাকা মূল্য');
  const [spintaxPreviewActive, setSpintaxPreviewActive] = useState(false);
  const [spintaxSeed, setSpintaxSeed] = useState(0);

  // Load post when selectedPostId changes
  useEffect(() => {
    if (!selectedPostId) {
      handleNewPost();
      return;
    }
    const current = posts.find(p => p.id === selectedPostId);
    if (current) {
      setTitle(current.title || '');
      setProductName(current.productName || '');
      setPrice(current.price || '');
      setLocation(current.location || '');
      setContactInfo(current.contactInfo || '');
      setCallToAction(current.callToAction || '');
      setCaption(current.caption || current.description || '');
      setTemplateId(current.templateId || '');
      setImages(current.images || []);
      if (current.price || current.location || current.contactInfo) {
        setShowOptionalFields(true);
      }
    }
  }, [selectedPostId, posts]);

  const handleNewPost = () => {
    setSelectedPostId('');
    setTitle('New Product Post');
    setProductName('');
    setPrice('');
    setLocation('');
    setContactInfo('');
    setCallToAction('Inbox for details!');
    setCaption('');
    setTemplateId('');
    setImages([]);
    setShowOptionalFields(false);
  };

  // Media Management
  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.warning(`Skipping unsupported file: ${file.name}`);
        return;
      }
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        if (result) {
          setImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveMedia = (index: number, direction: 'LEFT' | 'RIGHT') => {
    const targetIndex = direction === 'LEFT' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // AI Inline Generation
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const promptText = aiProductDetails.trim() || productName || title || caption;
      if (!promptText) {
        toast.warning('Please enter some product details or keywords for the AI.');
        setIsGeneratingAi(false);
        return;
      }

      const aiResult = await aiService.generateCaption({
        productName: promptText,
        price: price,
        style: aiStyle,
        language: aiLanguage,
        targetAudience: 'Facebook Community Members',
      });

      if (aiResult.success) {
        setCaption(aiResult.content);
        setIsAiModalOpen(false);
        toast.success('AI Caption generated & inserted!');
      } else {
        toast.error(aiResult.error || 'AI caption generation failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation error';
      toast.error(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Formatted Post preview output
  const previewPost: Post = {
    id: selectedPostId || 'preview',
    title: title.trim() || 'Untitled Post',
    productName: productName.trim() || title.trim(),
    price: price.trim(),
    description: caption.trim(),
    caption: caption.trim(),
    location: location.trim(),
    contactInfo: contactInfo.trim(),
    callToAction: callToAction.trim(),
    images,
    templateId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const activeTemplate = templateId ? templates.find(t => t.id === templateId) : undefined;
  const baseFormatted = activeTemplate
    ? formatPostWithTemplate(previewPost, activeTemplate.content)
    : (caption || formatPostWithTemplate(previewPost));
  const formattedPost = spintaxPreviewActive
    ? resolveSpintax(baseFormatted)
    : baseFormatted;

  // Insert text at cursor with precision
  const handleInsertTextAtCursor = (textToInsert: string, selectLength?: number) => {
    const el = textareaRef.current;
    if (!el) {
      setCaption(prev => prev + textToInsert);
      return;
    }
    const start = el.selectionStart ?? caption.length;
    const end = el.selectionEnd ?? caption.length;
    const nextCaption = caption.substring(0, start) + textToInsert + caption.substring(end);
    setCaption(nextCaption);

    setTimeout(() => {
      el.focus();
      if (typeof selectLength === 'number') {
        el.setSelectionRange(start, start + selectLength);
      } else {
        const newPos = start + textToInsert.length;
        el.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Apply Font Style
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
      toast.success(`Applied ${style} style!`);
    } else {
      if (!caption.trim()) {
        toast.warning('Please enter text first, or highlight a portion of text.');
        return;
      }
      setCaption(applyTextStyle(caption, style));
      toast.success(`Applied ${style} style!`);
    }
  };

  const handleApplyBoldAction = () => {
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
    toast.success('Applied Bold (**text**)!');
  };

  const handleApplyItalicAction = () => {
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
    toast.success('Applied Italic (*text*)!');
  };

  // Apply List Styles
  const handleApplyCustomListAction = (style: ListStyleType) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const bulleted = applyCustomList(selected, style);
      const nextCaption = caption.substring(0, start) + bulleted + caption.substring(end);
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + bulleted.length);
      }, 0);
    } else {
      const before = caption.substring(0, start);
      const after = caption.substring(end);
      const prefix = applyCustomList('', style);
      const needNewline = before.length > 0 && !before.endsWith('\n');
      const insertStr = (needNewline ? '\n' : '') + prefix;
      const nextCaption = before + insertStr + after;
      setCaption(nextCaption);
      setTimeout(() => {
        el.focus();
        const newPos = start + insertStr.length;
        el.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  // Apply Heading (H1 / H2)
  const handleApplyHeadingAction = (level: 1 | 2) => {
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
      toast.success(level === 1 ? 'Applied Heading 1 (H1)!' : 'Applied Heading 2 (H2)!');
    }
  };

  // Apply Blockquote
  const handleApplyBlockquoteAction = () => {
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

  // Auto-Beautify Magic
  const handleAutoBeautify = () => {
    if (!caption.trim()) {
      toast.warning('Please enter or paste your caption first.');
      return;
    }
    const beautified = autoBeautifyCaption(caption);
    setCaption(beautified);
    toast.success('✨ Caption Auto-Designed! (Italic Title, Indented Bullets & Notes applied)');
  };

  // Insert Quick Emoji
  const handleInsertEmoji = (emoji: string) => {
    handleInsertTextAtCursor(emoji + ' ');
  };

  // Insert Sales Snippet
  const handleInsertSnippetAction = (snippet: SalesSnippet) => {
    let content = snippet.content;
    const prod = productName.trim() || title.trim() || 'প্রোডাক্ট';
    const pr = price.trim() || 'ইনবক্স করুন';
    const loc = location.trim() || 'ঢাকা, বাংলাদেশ';
    const contact = contactInfo.trim() || 'ইনবক্স করুন';

    content = content
      .replace(/\{product_name\}/g, prod)
      .replace(/\{price\}/g, pr)
      .replace(/\{location\}/g, loc)
      .replace(/\{contact_info\}/g, contact);

    const el = textareaRef.current;
    const start = el?.selectionStart ?? caption.length;
    const before = caption.substring(0, start);
    const needNewline = before.length > 0 && !before.endsWith('\n');
    handleInsertTextAtCursor((needNewline ? '\n' : '') + content + '\n');
    toast.success(`Inserted ${snippet.name}`);
  };

  // Insert Decorative Divider
  const handleInsertDividerAction = (dividerValue: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? caption.length;
    const before = caption.substring(0, start);
    const needNewlineBefore = before.length > 0 && !before.endsWith('\n');
    handleInsertTextAtCursor((needNewlineBefore ? '\n' : '') + dividerValue + '\n');
    toast.success('Inserted decorative border');
  };

  // Apply Ready-made Design Preset
  const handleApplyPresetAction = (preset: CaptionPreset, mode: 'replace' | 'append') => {
    let tpl = preset.template;
    const prod = productName.trim() || title.trim() || 'SAMSUNG S20 5G';
    const pr = price.trim() || 'ইনবক্স';
    const loc = location.trim() || 'ঢাকা / বাংলাদেশ';
    const contact = contactInfo.trim() || '01XXXXXXXXX / ইনবক্স';

    tpl = tpl
      .replace(/\{product_name\}/g, prod)
      .replace(/\{price\}/g, pr)
      .replace(/\{location\}/g, loc)
      .replace(/\{contact_info\}/g, contact);

    if (mode === 'replace') {
      setCaption(tpl);
    } else {
      setCaption(prev => (prev.trim() ? prev + '\n\n' + tpl : tpl));
    }
    setIsPresetsModalOpen(false);
    toast.success(`Applied ${preset.name} layout!`);
  };

  // Fill Template directly into Editor for custom tweaking
  const handleFillTemplateToCaption = () => {
    if (!templateId) {
      toast.warning('Please select a template first from Optional Details.');
      return;
    }
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    const rendered = formatPostWithTemplate(previewPost, tpl.content);
    setCaption(rendered);
    toast.success(`Template "${tpl.name}" loaded into editor! You can now freely edit & design.`);
  };

  // Find & Replace
  const handleFindReplaceAction = () => {
    if (!findQuery.trim()) {
      toast.warning('Enter text to find');
      return;
    }
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const matches = (caption.match(regex) || []).length;
    if (matches === 0) {
      toast.info(`No matches found for "${findQuery}"`);
      return;
    }
    const nextCaption = caption.replace(regex, replaceQuery);
    setCaption(nextCaption);
    toast.success(`Replaced ${matches} occurrence(s)!`);
  };

  // Spintax Insertion
  const handleInsertSpintaxAction = (customPattern?: string) => {
    if (customPattern) {
      handleInsertTextAtCursor(customPattern);
      setIsSpintaxModalOpen(false);
      toast.success('Spintax pattern inserted!');
      return;
    }

    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const selected = caption.substring(start, end);
      const spintax = `{${selected}|${selected} (বিকল্প ১)|${selected} (বিকল্প ২)}`;
      handleInsertTextAtCursor(spintax, spintax.length);
      toast.success('Wrapped text in Spintax! You can edit the alternative words.');
    } else {
      setIsSpintaxModalOpen(true);
    }
  };

  // Handle rich HTML paste & deduplication
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
        toast.success('✨ Pasted with original Facebook design preserved!');
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
        toast.info('Cleaned duplicate text from paste!');
      }
    }
  };

  // Save current post
  const handleSaveCurrentPost = async (): Promise<Post> => {
    const now = Date.now();
    const cleanCaption = deduplicateRepeatedCaption(caption.trim());
    const postToSave: Post = {
      id: selectedPostId || generateId('post'),
      title: title.trim() || 'Untitled Post',
      productName: productName.trim() || title.trim(),
      price: price.trim(),
      oldPrice: '',
      description: cleanCaption,
      caption: cleanCaption,
      features: '',
      location: location.trim(),
      deliveryInfo: '',
      contactInfo: contactInfo.trim(),
      callToAction: callToAction.trim(),
      images,
      templateId,
      createdAt: selectedPostId ? (posts.find(p => p.id === selectedPostId)?.createdAt || now) : now,
      updatedAt: now,
    };

    await onSavePost(postToSave);
    setSelectedPostId(postToSave.id);
    return postToSave;
  };

  // Create Queue Handler
  const handleCreateQueueAction = async () => {
    if (!caption.trim() && images.length === 0) {
      toast.warning('Please enter a caption or add media before creating a queue.');
      return;
    }

    if (localSelectedIds.length === 0) {
      toast.warning('No groups selected! Please select groups first.');
      setIsSelectGroupsModalOpen(true);
      return;
    }

    // Save post first
    const savedPost = await handleSaveCurrentPost();

    // Create queue
    await onCreateQueue(localSelectedIds, savedPost.id);
    toast.success(`Created ${localSelectedIds.length} queue items! Ready to post.`);
    onNavigateTab('queue');
  };

  // Stats
  const charCount = caption.length;
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;
  const lineCount = caption ? caption.split('\n').length : 0;
  const spintaxCount = (caption.match(/\{[^{}]*\|[^{}]*\}/g) || []).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Post Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Post Composer & Caption Studio</span>
            <Badge variant="purple" size="sm">Design Suite</Badge>
          </h2>
          <p className="text-xs text-slate-400">
            সম্পূর্ণ নিজের মতো করে লেখার ফন্ট, স্টাইল, বুলেট, সেলস ট্যাগ ও ইমোজি দিয়ে পোস্ট তৈরি করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {posts.length > 0 && (
            <select
              value={selectedPostId}
              onChange={e => setSelectedPostId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {posts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title || 'Untitled Post'}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={14} />}
            onClick={handleNewPost}
          >
            New Post
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Save size={14} />}
            onClick={async () => {
              await handleSaveCurrentPost();
              toast.success('Post saved locally.');
            }}
          >
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media & Post Caption Editor */}
        <div className="lg:col-span-7 space-y-5">
          {/* Post Title & Identification */}
          <Card className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Post Title / Campaign Name
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Samsung S20 5G Sale / E-Commerce Hot Promo"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </Card>

          {/* Primary Caption Area with Rich Design Suite */}
          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-bold text-white tracking-wide">
                  Post Caption
                </label>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-medium">
                  Custom Design Studio
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Sparkles size={13} className="text-amber-300" />}
                  onClick={() => setIsAiModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold shadow-sm"
                >
                  Generate with AI
                </Button>
              </div>
            </div>

            {/* Design & Formatting Master Toolbar */}
            <div className="space-y-1.5 p-2.5 bg-slate-950/90 border border-slate-800 rounded-t-xl text-xs shadow-inner">
              {/* Row 1: Typography, Styles & Layout Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center gap-1">
                  {/* 1-Click Magic Auto-Design Button */}
                  <button
                    type="button"
                    onClick={handleAutoBeautify}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500/25 to-indigo-500/25 hover:from-amber-500/35 hover:to-indigo-500/35 border border-amber-500/40 text-amber-300 font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                    title="১-ক্লিকে ম্যাজিক অটো-ডিজাইন (Italic Title, Spec Bullets & Condition Notes)"
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    <span>✨ Magic Design</span>
                  </button>

                  {/* Ready Design Presets */}
                  <button
                    type="button"
                    onClick={() => setIsPresetsModalOpen(true)}
                    className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-bold rounded-lg flex items-center gap-1 transition-all"
                    title="তৈরি করা ডিজাইন টেমপ্লেটসমূহ দেখুন ও পছন্দ করুন"
                  >
                    <Layout size={12} className="text-indigo-400" />
                    <span>🎨 Layout Presets</span>
                  </button>

                  <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block"></div>

                  {/* Heading 1 */}
                  <button
                    type="button"
                    onClick={() => handleApplyHeadingAction(1)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all text-xs"
                    title="Heading 1 (বড় শিরোনাম - H1)"
                  >
                    H1
                  </button>

                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => handleApplyHeadingAction(2)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all text-xs"
                    title="Heading 2 (মাঝারি শিরোনাম - H2)"
                  >
                    H2
                  </button>

                  {/* Italic Button */}
                  <button
                    type="button"
                    onClick={handleApplyItalicAction}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all"
                    title="Italic (*text*)"
                  >
                    <span className="italic font-serif text-xs">𝘐</span> Italic
                  </button>

                  {/* Bold Button */}
                  <button
                    type="button"
                    onClick={handleApplyBoldAction}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all"
                    title="Bold (**text** - Works for Bengali, English, Emojis)"
                  >
                    <span className="font-bold text-xs">𝐁</span> Bold
                  </button>

                  {/* Bold Italic */}
                  <button
                    type="button"
                    onClick={() => handleApplyStyle('sans-bold-italic')}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all hidden md:flex items-center gap-0.5"
                    title="Bold Italic (e.g. 𝙨𝙖𝙡𝙚)"
                  >
                    <span className="italic font-bold text-xs">𝑩</span>
                  </button>

                  {/* Strikethrough (Price Cut) */}
                  <button
                    type="button"
                    onClick={() => handleApplyStyle('strikethrough')}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all"
                    title="Strikethrough / কাটা দাগ (মূল্য ছাড়ে ব্যবহারের জন্য: ̶২̶,̶৫̶০̶০̶ ৳)"
                  >
                    <span className="line-through text-xs font-mono">S</span> Strike
                  </button>

                  {/* Underline */}
                  <button
                    type="button"
                    onClick={() => handleApplyStyle('underline')}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all hidden sm:inline-block"
                    title="Underline (u̲n̲d̲e̲r̲l̲i̲n̲e̲)"
                  >
                    <span className="underline text-xs">U</span> Under
                  </button>

                  {/* Numbered List */}
                  <button
                    type="button"
                    onClick={() => handleApplyCustomListAction('number')}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all text-xs"
                    title="Numbered List (১, ২, ৩ নাম্বারিং)"
                  >
                    1. List
                  </button>

                  {/* Blockquote */}
                  <button
                    type="button"
                    onClick={handleApplyBlockquoteAction}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-200 font-bold rounded-md transition-all text-xs"
                    title="Blockquote (কোটেশন বা হাইলাইট বক্স)"
                  >
                    ❞ Quote
                  </button>

                  {/* Font Styles Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyStyle(e.target.value as FontStyleType);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    title="More Unicode Font Styles"
                  >
                    <option value="" disabled>🔤 Font Styles</option>
                    <option value="sans-italic">𝘴𝘢𝘭𝘦 (Sans Italic)</option>
                    <option value="sans-bold">𝘀𝗮𝗹𝗲 (Sans Bold)</option>
                    <option value="sans-bold-italic">𝙨𝙖𝙡𝙚 (Bold Italic)</option>
                    <option value="serif-italic">𝑠𝑎𝑙𝑒 (Serif Italic)</option>
                    <option value="serif-bold">𝐬𝐚𝐥𝐞 (Serif Bold)</option>
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
                  </select>

                  {/* Case converter */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyStyle(e.target.value as FontStyleType);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer hidden md:block"
                    title="Change Letter Case"
                  >
                    <option value="" disabled>Aa Case</option>
                    <option value="uppercase">UPPERCASE (সব বড়)</option>
                    <option value="lowercase">lowercase (সব ছোট)</option>
                    <option value="titlecase">Title Case (প্রতিটি শব্দের ১ম অক্ষর বড়)</option>
                  </select>

                  {/* Bullet styles */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyCustomListAction(e.target.value as ListStyleType);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    title="List & Bullet Styles"
                  >
                    <option value="" disabled>📋 Bullets</option>
                    <option value="bullet">• Standard Bullet (  • Item)</option>
                    <option value="check">✓ Checkmark (  ✓ Item)</option>
                    <option value="arrow">➤ Arrow (  ➤ Item)</option>
                    <option value="star">★ Star (  ★ Item)</option>
                    <option value="diamond">❖ Diamond (  ❖ Item)</option>
                    <option value="number">1. Numbered (  1. Item)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyStyle('normal')}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded border border-transparent hover:border-rose-800 transition-all"
                  title="Clear font styling and convert back to plain text"
                >
                  Clear Style
                </button>
              </div>

              {/* Row 2: Sales Tags, Borders, Spintax & Find/Replace */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Sales Snippets Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const snip = SALES_SNIPPETS.find(s => s.id === e.target.value);
                        if (snip) handleInsertSnippetAction(snip);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-emerald-300 font-semibold text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    title="Insert Ready Sales Tags & Elements"
                  >
                    <option value="" disabled>🏷️ 1-Click Sales Tags</option>
                    {SALES_SNIPPETS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Decorative Borders Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleInsertDividerAction(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                    title="Insert Decorative Divider Border"
                  >
                    <option value="" disabled>➖ Decorative Borders</option>
                    {DECORATIVE_DIVIDERS.map(d => (
                      <option key={d.name} value={d.value}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* Spintax Tool */}
                  <button
                    type="button"
                    onClick={() => handleInsertSpintaxAction()}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-white rounded-md flex items-center gap-1 transition-all"
                    title="Wrap text in Spintax {opt1|opt2|opt3} to prevent Facebook spam blocking"
                  >
                    <Shuffle size={12} className="text-indigo-400" />
                    <span>Spintax</span>
                  </button>

                  {/* Find & Replace Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsFindReplaceOpen(prev => !prev)}
                    className={`px-2 py-1 border rounded-md flex items-center gap-1 transition-all ${
                      isFindReplaceOpen
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                    title="Find & Replace words or prices in caption"
                  >
                    <Search size={12} />
                    <span>Find/Replace</span>
                  </button>
                </div>

                {templateId && (
                  <button
                    type="button"
                    onClick={handleFillTemplateToCaption}
                    className="text-[11px] text-indigo-400 hover:text-indigo-200 font-semibold flex items-center gap-1 py-1 px-2 rounded hover:bg-indigo-950/50"
                    title="Fill active layout template directly into caption editor"
                  >
                    <span>📥 Fill Template to Editor</span>
                  </button>
                )}
              </div>

              {/* Row 3: Quick Clickable Emojis Strip */}
              <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
                <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0">
                  Quick Emojis:
                </span>
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {POPULAR_QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded text-sm transition-transform active:scale-125"
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmojisModalOpen(true)}
                  className="px-2 py-0.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-semibold rounded text-[11px] shrink-0 ml-1 flex items-center gap-1"
                >
                  <Smile size={12} />
                  <span>More...</span>
                </button>
              </div>

              {/* Collapsible Find & Replace Drawer */}
              {isFindReplaceOpen && (
                <div className="p-2 bg-slate-900 border border-slate-700/80 rounded-lg space-y-2 mt-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                    <span>🔍 Find & Replace Tool</span>
                    <button
                      type="button"
                      onClick={() => setIsFindReplaceOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={findQuery}
                        onChange={e => setFindQuery(e.target.value)}
                        placeholder="Find (e.g. 2,500 or Dhaka)"
                        className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={replaceQuery}
                        onChange={e => setReplaceQuery(e.target.value)}
                        placeholder="Replace with (e.g. 1,999 or Chittagong)"
                        className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleFindReplaceAction}
                        className="w-full py-1 text-xs"
                      >
                        Replace All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Detected Warning Banner */}
            {caption.trim() && deduplicateRepeatedCaption(caption) !== caption && (
              <div className="flex items-center justify-between p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl text-xs text-amber-200 shadow-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <span>⚠️ <strong>ডুপ্লিকেট ক্যাপশন ধরা পড়েছে!</strong> একই লেখা ২ বার পেস্ট হয়েছে।</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const cleaned = deduplicateRepeatedCaption(caption);
                    setCaption(cleaned);
                    toast.success('ডুপ্লিকেট লেখা দূর করা হয়েছে!');
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition-colors shadow"
                >
                  ডুপ্লিকেট মুছুন (Fix Now)
                </button>
              </div>
            )}

            {/* Caption Textarea with High-fidelity editing */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={11}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                onPaste={handlePasteCaption}
                placeholder="Write or paste your custom post caption here...&#10;&#10;✨ Tip: Use the toolbar above to apply Italic, Bold, Strikethrough, Bullets, Borders, or choose a 1-click Preset!&#10;&#10;e.g.,&#10;𝘴𝘢𝘭𝘦 𝘰𝘳 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦&#10;&#10;𝘮𝘰𝘥𝘦𝘭 : SAMSUNG S20 5G&#10;  • Ram : 12gb&#10;  • STOREGE : 256 gb&#10;  • gaming joss&#10;  • phone ekdom smotooth ase&#10;𝘑𝘦𝘬𝘰𝘯𝘰 𝘱𝘩𝘰𝘯𝘦 𝘦𝘳 𝘴𝘢𝘵𝘩𝘦 𝘦𝘹𝘤𝘩𝘢𝘯𝘨𝘦 𝘩𝘣𝘦 𝘢𝘥𝘥 𝘭𝘢𝘨𝘣𝘦&#10;💰 𝘱𝘳𝘪𝘤𝘦 : 28,500&#10;📍 𝘭𝘰𝘤𝘢𝘵𝘪𝘰𝘯 : Dhaka"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-b-xl rounded-t-none border-t-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y shadow-inner"
              />
            </div>

            {/* Statistics & Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <span>Characters: <strong className="text-slate-200">{charCount}</strong></span>
                <span>Words: <strong className="text-slate-200">{wordCount}</strong></span>
                <span>Lines: <strong className="text-slate-200">{lineCount}</strong></span>
                {spintaxCount > 0 && (
                  <span className="text-indigo-400 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                    🔄 {spintaxCount} Spintax variations active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {caption.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear the caption?')) setCaption('');
                    }}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear Caption
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (await copyToClipboard(caption)) toast.success('Caption copied!');
                  }}
                  className="hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Copy size={12} />
                  <span>Copy Caption</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Media Attachments Section */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon size={16} className="text-indigo-400" />
                  <span>Media Attachments</span>
                  <Badge variant="default" size="sm">{images.length} files</Badge>
                </h3>
                <p className="text-xs text-slate-400">
                  Upload product photos or video previews. Drag & drop or reorder as needed.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => fileInputRef.current?.click()}
              >
                + Add Media
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
              }`}
            >
              <UploadCloud size={32} className="mx-auto text-slate-500 mb-2" />
              <div className="text-xs font-semibold text-slate-300">
                Click to browse or drag and drop images here
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                PNG, JPG, WEBP, MP4 supported
              </div>
            </div>

            {/* Media Previews / Thumbnails */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {images.map((mediaUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-square flex items-center justify-center shadow-sm"
                  >
                    {mediaUrl.startsWith('data:video') ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={mediaUrl} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                    )}

                    {/* Order badge & Video badge */}
                    <div className="absolute top-1 left-1 flex items-center gap-1 z-10">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                      {(mediaUrl.startsWith('data:video') || mediaUrl.includes('video') || mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov')) && (
                        <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/50 backdrop-blur-xs flex items-center gap-0.5">
                          ▶ Video
                        </span>
                      )}
                    </div>

                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveMedia(idx, 'LEFT');
                          }}
                          className="p-1 rounded bg-slate-800 text-white hover:bg-indigo-600"
                          title="Move Left"
                        >
                          <ChevronLeft size={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveMedia(idx);
                        }}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                        title="Remove"
                      >
                        <X size={13} />
                      </button>

                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveMedia(idx, 'RIGHT');
                          }}
                          className="p-1 rounded bg-slate-800 text-white hover:bg-indigo-600"
                          title="Move Right"
                        >
                          <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Optional Structured Fields (Collapsible) */}
          <Card className="p-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowOptionalFields(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-indigo-400" />
                <span>Optional Listing Details (Price, Location, Contact, CTA)</span>
              </div>
              {showOptionalFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showOptionalFields && (
              <div className="pt-3 space-y-3 border-t border-slate-800 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      placeholder="e.g., Hero Ranger 26T Cycle"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price</label>
                    <input
                      type="text"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="e.g., ৳৭,৫০০ / $85"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g., Chattogram / Dhaka"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contact / Inbox</label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={e => setContactInfo(e.target.value)}
                      placeholder="e.g., Inbox or 017XXXXXXXX"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={e => setCallToAction(e.target.value)}
                    placeholder="e.g., দ্রুত ইনবক্স করুন, লিমিটেড স্টক!"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {templates.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400">Apply Layout Template</label>
                      <button
                        type="button"
                        onClick={handleFillTemplateToCaption}
                        className="text-[11px] text-indigo-400 hover:text-indigo-200 font-semibold flex items-center gap-1"
                        title="Fill template into caption editor so you can edit and design everything"
                      >
                        📥 Fill into Caption Editor
                      </button>
                    </div>
                    <select
                      value={templateId}
                      onChange={e => setTemplateId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">None (Raw Caption)</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Post Preview & Queue Creator */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-5 border-indigo-500/30 bg-slate-900/80 sticky top-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Post Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {spintaxCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpintaxPreviewActive(true);
                      setSpintaxSeed(prev => prev + 1);
                      toast.info('🎲 Shuffled spintax preview!');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    title="Preview another random spintax combination"
                  >
                    <Shuffle size={12} />
                    <span>Test Spintax</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    if (await copyToClipboard(formattedPost)) toast.success('Copied full post preview!');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Copy size={12} />
                  <span>Copy Full</span>
                </button>
              </div>
            </div>

            {/* Media Preview Carousel/Grid */}
            {images.length > 0 ? (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center relative">
                  {images[0].startsWith('data:video') ? (
                    <video src={images[0]} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={images[0]} alt="Primary media" className="w-full h-full object-cover" />
                  )}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                      +{images.length - 1} more media
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-6 text-center text-xs text-slate-500">
                No media attached. (Images/video will appear here)
              </div>
            )}

            {/* Formatted Text Box */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-inner">
              {formattedPost.trim() ? (
                formattedPost
              ) : (
                <span className="text-slate-600 italic">
                  আমার পোস্টের ডিজাইন করা caption এখানে হুবহু প্রদর্শিত হবে...
                </span>
              )}
            </div>

            {/* Selected Groups Indicator */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Selected Target Groups:</span>
                <span className="font-bold text-indigo-300">{localSelectedIds.length} groups</span>
              </div>

              {localSelectedIds.length === 0 ? (
                <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
                  <span>⚠️ No groups selected. Click below to select or sync your groups.</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 truncate">
                  Targeting: {groups.filter(g => localSelectedIds.includes(g.id)).map(g => g.name).slice(0, 2).join(', ')}
                  {localSelectedIds.length > 2 && ` +${localSelectedIds.length - 2} more`}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={<Users size={13} />}
                onClick={() => setIsSelectGroupsModalOpen(true)}
                className="w-full text-xs font-semibold py-1.5 border-indigo-500/40 text-indigo-200 hover:text-white"
              >
                {localSelectedIds.length > 0
                  ? `Select / Change Groups (${localSelectedIds.length})`
                  : '⚡ Select / Sync Groups'}
              </Button>
            </div>

            {/* Big Action: Create Queue */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={16} />}
                onClick={handleCreateQueueAction}
                disabled={localSelectedIds.length === 0 || (!caption.trim() && images.length === 0)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 font-bold text-sm py-3"
              >
                Create Posting Queue ({localSelectedIds.length} Groups)
              </Button>

              <div className="text-center text-[11px] text-slate-500">
                Generates a human-in-the-loop sequential queue for each selected group.
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Ready Design Presets Modal */}
      <Modal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        title="🎨 Ready-Made Caption Design Presets"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-400">
            ফেসবুক গ্রুপ ও মার্কেটপ্লেসে বেশি বিক্রির জন্য তৈরি করা প্রিমিয়াম লেআউট। ১-ক্লিকে নিজের তথ্য দিয়ে ব্যবহার করুন।
          </p>

          <div className="grid grid-cols-1 gap-3">
            {CAPTION_PRESETS.map(preset => (
              <div
                key={preset.id}
                className="p-3.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl space-y-2.5 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{preset.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{preset.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {preset.categoryName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{preset.description}</p>
                    </div>
                  </div>
                </div>

                {/* Template snippet preview */}
                <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800/80 leading-relaxed">
                  {preset.template
                    .replace(/\{product_name\}/g, productName.trim() || title.trim() || 'Samsung S20 5G')
                    .replace(/\{price\}/g, price.trim() || '28,500 ৳')
                    .replace(/\{location\}/g, location.trim() || 'Dhaka')
                    .replace(/\{contact_info\}/g, contactInfo.trim() || '01XXXXXXXXX / Inbox')}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPresetAction(preset, 'append')}
                    className="text-xs py-1"
                  >
                    + Append to Caption
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyPresetAction(preset, 'replace')}
                    className="text-xs py-1 bg-indigo-600 hover:bg-indigo-500"
                  >
                    Use This Layout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Full Categorized Emojis Modal */}
      <Modal
        isOpen={isEmojisModalOpen}
        onClose={() => setIsEmojisModalOpen(false)}
        title="😊 Facebook Sales Emojis Catalog"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveEmojiTab(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEmojiTab === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Active Category Emoji Grid */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 mb-2">
              {EMOJI_CATEGORIES[activeEmojiTab].category} (Click to insert):
            </h4>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {EMOJI_CATEGORIES[activeEmojiTab].emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleInsertEmoji(emoji);
                    toast.success(`Inserted ${emoji}`);
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-800 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Spintax Helper Modal */}
      <Modal
        isOpen={isSpintaxModalOpen}
        onClose={() => setIsSpintaxModalOpen(false)}
        title="🔄 Spintax Generator (অ্যান্টি-স্প্যাম অপশন)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            স্পিনট্যাক্স প্রতিটি গ্রুপে ভিন্ন ভিন্ন শব্দ পাঠায়, ফলে ফেসবুক আপনাকে স্প্যামার হিসেবে চিহ্নিত বা ব্লক করে না।
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Options (পাইপ | দিয়ে বিকল্পগুলো আলাদা করুন):
            </label>
            <input
              type="text"
              value={spintaxOptionsInput}
              onChange={e => setSpintaxOptionsInput(e.target.value)}
              placeholder="e.g., অফার ১ | সেরা ডিল | স্পেশাল মূল্য"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">জনপ্রিয় স্পিনট্যাক্স প্রি-সেট:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '{হ্যালো বন্ধুরা|আসসালামু আলাইকুম|নমস্কার বন্ধুরা}',
                '{১০০% অরিজিনাল|একদম জেনুইন|প্রিমিয়াম কোয়ালিটি}',
                '{দ্রুত ইনবক্স করুন|লিমিটেড স্টক|অফার শেষ হওয়ার আগেই নিন}',
                '{হোম ডেলিভারি সুবিধা|ক্যাশ অন ডেলিভারি সারা দেশে}',
              ].map((pattern, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSpintaxAction(pattern)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg text-left"
                >
                  {pattern}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsSpintaxModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const parts = spintaxOptionsInput.split('|').map(p => p.trim()).filter(Boolean);
                if (parts.length < 2) {
                  toast.warning('কমপক্ষে ২টি অপশন দিন (| দিয়ে আলাদা করুন)');
                  return;
                }
                handleInsertSpintaxAction(`{${parts.join('|')}}`);
              }}
            >
              Insert Spintax
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Caption Generation Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="AI Copywriter Assistant"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Generate high-converting Facebook group captions in Bangla, Banglish, or English.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Details / Key Benefits
            </label>
            <textarea
              rows={3}
              value={aiProductDetails}
              onChange={e => setAiProductDetails(e.target.value)}
              placeholder="e.g., Hero Ranger bicycle, used 3 months, full fresh, Shimano gears..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
              <select
                value={aiLanguage}
                onChange={e => setAiLanguage(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Bangla">Bangla (বাংলা)</option>
                <option value="Banglish">Banglish (বাংলা ইংরেজি হরফে)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Style</label>
              <select
                value={aiStyle}
                onChange={e => setAiStyle(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Sales">Persuasive / Sales</option>
                <option value="Marketplace">Facebook Marketplace</option>
                <option value="Friendly">Friendly / Community</option>
                <option value="Professional">Professional</option>
                <option value="Short">Short & Punchy</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="md" onClick={() => setIsAiModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isGeneratingAi}
              icon={<Sparkles size={14} />}
              onClick={handleGenerateAi}
            >
              Generate & Insert Caption
            </Button>
          </div>
        </div>
      </Modal>

      {/* Select Groups Modal */}
      <SelectGroupsModal
        isOpen={isSelectGroupsModalOpen}
        onClose={() => setIsSelectGroupsModalOpen(false)}
        groups={groups}
        selectedGroupIds={localSelectedIds}
        onConfirm={(selectedGroups) => {
          const ids = selectedGroups.map(g => g.id);
          setLocalSelectedIds(ids);
          toast.success(`Selected ${ids.length} groups for posting!`);
        }}
        onSaveGroups={onSaveGroups}
      />
    </div>
  );
};
