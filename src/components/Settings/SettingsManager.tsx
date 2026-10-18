import React, { useState } from 'react';
import { AppSettings, BackupData } from '../../types/settings';
import { AIProviderType, AILanguage, AIStyle } from '../../types/ai';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Sliders,
  Sparkles,
  Database,
  Webhook,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { createFullBackup, inspectBackupJson, restoreFromBackup, RestorePreview } from '../../services/backup/backup-service';
import { downloadFile } from '../../utils/helpers';
import { useToast } from '../common/Toast';

interface SettingsManagerProps {
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onResetAllData: () => Promise<void>;
  onReloadData: () => Promise<void>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSaveSettings,
  onResetAllData,
  onReloadData,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'queue' | 'ai' | 'facebook' | 'webhook' | 'storage'>('ai');

  // Working state copy
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);

  // Backup & restore state
  const [backupFileText, setBackupFileText] = useState<string>('');
  const [backupPreview, setBackupPreview] = useState<RestorePreview | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleProviderPresetChange = (provider: AIProviderType) => {
    let endpoint = 'https://api.openai.com/v1';
    let model = 'gpt-4o-mini';

    if (provider === 'gemini') {
      endpoint = 'https://generativelanguage.googleapis.com';
      model = 'gemini-1.5-flash';
    } else if (provider === 'custom') {
      endpoint = 'https://api.yourcustomendpoint.com/v1';
      model = 'custom-model';
    }

    setFormData(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        provider,
        endpoint,
        model,
      },
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    const backup = await createFullBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    downloadFile(`ai-group-poster-backup-${Date.now()}.json`, jsonStr, 'application/json');
    toast.success('System backup exported successfully!');
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBackupFileText(text);
      const { preview, parsed, error } = inspectBackupJson(text);
      if (error || !preview || !parsed) {
        toast.error(error || 'Invalid backup file');
        return;
      }
      setBackupPreview(preview);
      setParsedBackup(parsed);
      setIsBackupModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyRestore = async (mode: 'REPLACE' | 'MERGE') => {
    if (!parsedBackup) return;
    try {
      await restoreFromBackup(parsedBackup, mode);
      await onReloadData();
      toast.success(`Backup restored in ${mode} mode!`);
      setIsBackupModalOpen(false);
    } catch (err) {
      toast.error('Failed to restore backup');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">System Settings</h3>
          <p className="text-xs text-slate-400">
            Configure AI credentials, queue pacing safeguards, Facebook domains, and backup policies.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save size={14} />}
          isLoading={isSaving}
          onClick={handleSaveAll}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings Tab Navigation */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles size={16} />
            <span>AI Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders size={16} />
            <span>Queue & Pacing</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sliders size={16} />
            <span>General Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('facebook')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'facebook'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe size={16} />
            <span>Facebook & Helper</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'webhook'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Webhook size={16} />
            <span>Webhook / n8n</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database size={16} />
            <span>Backup & Storage</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-9 space-y-4">
          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <Card title="AI Provider Configuration" subtitle="Configure modular OpenAI, Google Gemini, or Custom endpoint">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">AI Provider</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['openai', 'gemini', 'custom'] as AIProviderType[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleProviderPresetChange(p)}
                        className={`p-3 rounded-xl border text-center font-bold capitalize transition ${
                          formData.ai.provider === p
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {p === 'openai' ? 'OpenAI (or Compatible)' : p === 'gemini' ? 'Google Gemini' : 'Custom API'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">API Base Endpoint</label>
                    <input
                      type="text"
                      value={formData.ai.endpoint}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, endpoint: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                    <input
                      type="text"
                      placeholder={formData.ai.provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'}
                      value={formData.ai.model}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, model: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    API Key {formData.ai.provider !== 'custom' && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={formData.ai.apiKey}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, apiKey: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 pr-10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Stored securely in Chrome local extension storage. Never transmitted to third-party tracking servers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Temperature ({formData.ai.temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.ai.temperature}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, temperature: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Default Language</label>
                    <select
                      value={formData.ai.defaultLanguage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, defaultLanguage: e.target.value as AILanguage },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Bangla">Bangla</option>
                      <option value="Banglish">Banglish</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Default Style</label>
                    <select
                      value={formData.ai.defaultStyle}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          ai: { ...formData.ai, defaultStyle: e.target.value as AIStyle },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Marketplace">Marketplace</option>
                      <option value="Professional">Professional</option>
                      <option value="Friendly">Friendly</option>
                      <option value="Sales">Sales</option>
                      <option value="Short">Short</option>
                      <option value="Minimal">Minimal</option>
                      <option value="Detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Queue & Pacing Settings Tab */}
          {activeTab === 'queue' && (
            <Card title="Queue & Pacing Safeguards" subtitle="Human pacing rules to ensure platform safety and prevent rapid posting">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-white">Auto-Open Next Group Tab</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Automatically navigate browser to the next group after you confirm "Mark as Posted".
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.queue.autoOpenNextGroup}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        queue: { ...formData.queue, autoOpenNextGroup: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-white">Require Confirmation Before Continuing</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Ensures the extension never skips ahead without an explicit click.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.queue.requireConfirmation}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        queue: { ...formData.queue, requireConfirmation: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-slate-300 font-semibold mb-1">
                      Pacing Delay Between Groups (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={formData.queue.delayBetweenItemsSec}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          queue: { ...formData.queue, delayBetweenItemsSec: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Recommended: 15–45s for natural browsing cadence.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <label className="block text-slate-300 font-semibold mb-1">
                      Maximum Posts Per Session
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.queue.maxItemsPerSession}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          queue: { ...formData.queue, maxItemsPerSession: parseInt(e.target.value) || 50 },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Automatically pauses queue after this count.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* General Preferences Tab */}
          {activeTab === 'general' && (
            <Card title="General Preferences" subtitle="Extension branding, theme, and desktop alerts">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Extension Name</label>
                  <input
                    type="text"
                    value={formData.general.extensionName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        general: { ...formData.general, extensionName: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-white">Browser Notifications</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Show Chrome notifications when a group is opened, paused, or finished.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.general.notificationsEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        general: { ...formData.general, notificationsEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Facebook & Helper Tab */}
          {activeTab === 'facebook' && (
            <Card title="Facebook Page Detection & Helper Panel" subtitle="Floating dock settings when visiting Facebook Groups">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-white">Enable In-Page Helper Dock</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Renders the non-invasive collapsible helper widget on Facebook group pages.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.facebook.helperDockEnabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        facebook: { ...formData.facebook, helperDockEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Supported Facebook Domains (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.facebook.supportedDomains.join(', ')}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        facebook: {
                          ...formData.facebook,
                          supportedDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Webhook Settings Tab */}
          {activeTab === 'webhook' && (
            <Card title="Webhook / n8n Automation (Optional)" subtitle="Dispatch event payloads to n8n, Make, or Zapier workflows">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-white">Enable Webhook Dispatches</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Disabled by default. Only sends events when enabled here.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.webhook.enabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        webhook: { ...formData.webhook, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Webhook Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://your-n8n-instance.com/webhook/agp-events"
                    value={formData.webhook.endpoint}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        webhook: { ...formData.webhook, endpoint: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secret Key (Optional Header)</label>
                  <input
                    type="password"
                    placeholder="Shared secret for x-agp-secret header"
                    value={formData.webhook.secret}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        webhook: { ...formData.webhook, secret: e.target.value },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Backup & Storage Tab */}
          {activeTab === 'storage' && (
            <Card title="Storage Backup & Reset" subtitle="Export or restore your full extension database">
              <div className="space-y-6 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">Full System Backup</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Download a complete JSON snapshot containing all your groups, posts, templates, queue, and settings.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={handleExportBackup}
                  >
                    Export JSON Backup
                  </Button>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">Restore from Backup</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Select an existing backup file to inspect and restore data safely.
                    </p>
                  </div>
                  <label className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition select-none">
                    <Upload size={14} />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleBackupFileSelect}
                    />
                  </label>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-red-300">Reset All Extension Data</h4>
                    <p className="text-red-400/80 text-[11px] mt-0.5">
                      Permanently wipes all groups, posts, queue items, logs, and resets settings to defaults.
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    Reset Everything
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Backup Inspection & Restore Modal */}
      <Modal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        title="Restore Backup Confirmation"
        description="Verify the backup contents before applying changes to your browser storage."
        maxWidth="lg"
      >
        {backupPreview && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{backupPreview.groupCount}</div>
                <div className="text-[10px] text-slate-400">Groups</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{backupPreview.postCount}</div>
                <div className="text-[10px] text-slate-400">Posts</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
                <div className="text-lg font-bold text-white">{backupPreview.templateCount}</div>
                <div className="text-[10px] text-slate-400">Templates</div>
              </div>
            </div>

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs">
              Choose how you want to restore:
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li><strong>Replace:</strong> Overwrite all current data with backup data.</li>
                <li><strong>Merge:</strong> Append new items without deleting existing data.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsBackupModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleApplyRestore('MERGE')}>
                Merge Data
              </Button>
              <Button variant="danger" onClick={() => handleApplyRestore('REPLACE')}>
                Replace All Data
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={async () => {
          await onResetAllData();
          await onReloadData();
          toast.info('All data has been reset to factory defaults.');
          setIsResetConfirmOpen(false);
        }}
        title="Factory Reset Warning"
        message="Are you completely sure you want to wipe all stored data? This will erase all groups, posts, templates, queue items, and history permanently."
        confirmLabel="Yes, Reset Everything"
      />
    </div>
  );
};
