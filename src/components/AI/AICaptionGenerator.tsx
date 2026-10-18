import React, { useState } from 'react';
import { AILanguage, AIPromptContext, AIStyle, AIOperation } from '../../types/ai';
import { AppSettings } from '../../types/settings';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  RefreshCw,
  Minimize2,
  Maximize2,
  Briefcase,
  Smile,
  Languages,
  Copy,
  Check,
  ArrowRight,
  Settings as SettingsIcon,
  AlertCircle,
} from 'lucide-react';
import { aiService } from '../../services/ai/ai-service';
import { copyToClipboard } from '../../utils/helpers';
import { useToast } from '../common/Toast';
import { TabType } from '../layout/Sidebar';

interface AICaptionGeneratorProps {
  settings: AppSettings;
  onApplyCaptionToPost?: (caption: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const AICaptionGenerator: React.FC<AICaptionGeneratorProps> = ({
  settings,
  onApplyCaptionToPost,
  onNavigateTab,
}) => {
  const toast = useToast();

  // Inputs
  const [productName, setProductName] = useState('Yamaha FZS V3 (Matte Black)');
  const [productDetails, setProductDetails] = useState('First owner, carefully driven 14,000 km, digital number plate, smart card available, no scratch or accident history.');
  const [price, setPrice] = useState('2,15,000 BDT');
  const [condition, setCondition] = useState('Mint / Pre-owned');
  const [location, setLocation] = useState('Mirpur, Dhaka');
  const [targetAudience, setTargetAudience] = useState('Local bike enthusiasts & commuters');
  const [language, setLanguage] = useState<AILanguage>(settings.ai.defaultLanguage || 'Bangla');
  const [style, setStyle] = useState<AIStyle>(settings.ai.defaultStyle || 'Marketplace');

  // Output & State
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastDurationMs, setLastDurationMs] = useState<number | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const isConfigured = Boolean(settings.ai.apiKey) || settings.ai.provider === 'custom';

  const handleGenerate = async (operation: AIOperation = 'generate', targetLang?: AILanguage) => {
    if (!productName.trim()) {
      toast.error('Product Name is required');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const context: AIPromptContext = {
      productName: productName.trim(),
      productDetails: productDetails.trim(),
      price: price.trim(),
      condition: condition.trim(),
      location: location.trim(),
      targetAudience: targetAudience.trim(),
      language,
      style,
      currentCaption: generatedCaption,
      targetLanguage: targetLang,
    };

    try {
      const result = operation === 'generate'
        ? await aiService.generateCaption(context)
        : await aiService.transformCaption(operation, generatedCaption, context);

      if (result.success && result.content) {
        setGeneratedCaption(result.content);
        setLastDurationMs(result.durationMs);
        toast.success(`Caption ready (${result.durationMs}ms)`);
      } else {
        const err = result.error || 'Failed to generate caption';
        setErrorMessage(err);
        toast.error(err);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCaption) return;
    const ok = await copyToClipboard(generatedCaption);
    if (ok) {
      setCopied(true);
      toast.success('Caption copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyToComposer = () => {
    if (!generatedCaption) return;
    if (onApplyCaptionToPost) {
      onApplyCaptionToPost(generatedCaption);
      toast.success('Caption applied to post!');
    }
    onNavigateTab('composer');
  };

  return (
    <div className="space-y-6">
      {/* Top Config Status Card */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AI Caption Generator</span>
              <Badge variant="purple">
                {settings.ai.provider.toUpperCase()} • {settings.ai.model}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Provider endpoint: {settings.ai.endpoint}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<SettingsIcon size={14} />}
          onClick={() => onNavigateTab('settings')}
        >
          Configure AI API
        </Button>
      </div>

      {!isConfigured && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
            <span>
              Your <strong>{settings.ai.provider.toUpperCase()} API key</strong> is not set. Please add your key in Settings to generate live captions.
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigateTab('settings')}
          >
            Open Settings
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs form */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="Product & Tone Inputs" subtitle="Provide parameters for the AI copywriter">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yamaha FZS V3 FI ABS"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price</label>
                  <input
                    type="text"
                    placeholder="e.g. 2,15,000 BDT"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Mint, Brand New, Used"
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Details & Perks</label>
                <textarea
                  rows={3}
                  placeholder="Specifications, warranty, papers, accessories included..."
                  value={productDetails}
                  onChange={e => setProductDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mirpur, Dhaka"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Daily commuters, students"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value as AILanguage)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Bangla">Bangla (বাংলা)</option>
                    <option value="Banglish">Banglish (Phonetic English)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Writing Style</label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value as AIStyle)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Marketplace">Marketplace (Direct & Catchy)</option>
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly & Personal</option>
                    <option value="Sales">Sales & Urgent</option>
                    <option value="Short">Short & Punchy</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Detailed">Detailed</option>
                  </select>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full mt-3"
                icon={<Sparkles size={16} />}
                isLoading={isLoading}
                onClick={() => handleGenerate('generate')}
              >
                Generate Caption
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Output & Quick Modifiers */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Generated Caption"
            subtitle={lastDurationMs ? `Generated in ${lastDurationMs}ms` : 'Ready to post'}
            headerAction={
              generatedCaption ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight size={13} />}
                    onClick={handleApplyToComposer}
                  >
                    Use in Post
                  </Button>
                </div>
              ) : null
            }
          >
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs">
                  {errorMessage}
                </div>
              )}

              <textarea
                rows={10}
                placeholder="Generated AI caption will appear here. You can also edit it directly in this box..."
                value={generatedCaption}
                onChange={e => setGeneratedCaption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-indigo-500 resize-y"
              />

              {/* Quick AI Modifiers Toolbar */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  One-Click AI Refinements
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => handleGenerate('regenerate')}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Minimize2 size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => handleGenerate('shorten')}
                  >
                    Shorten
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Maximize2 size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => handleGenerate('expand')}
                  >
                    Expand
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Briefcase size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => handleGenerate('make_professional')}
                  >
                    Professional
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Smile size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => handleGenerate('make_natural')}
                  >
                    Make Natural
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Languages size={12} />}
                    disabled={!generatedCaption || isLoading}
                    onClick={() => {
                      const nextLang: AILanguage = language === 'Bangla' ? 'English' : 'Bangla';
                      handleGenerate('translate', nextLang);
                    }}
                  >
                    {language === 'Bangla' ? 'To English' : 'To Bangla'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
