import React from 'react';
import {
  LayoutDashboard,
  Users,
  PenSquare,
  ListOrdered,
  Sparkles,
  History as HistoryIcon,
  FileText,
  FileCode2,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'groups'
  | 'composer'
  | 'queue'
  | 'history'
  | 'ai'
  | 'templates'
  | 'logs'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  queueCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  queueCount,
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'groups', label: 'My Groups', icon: <Users size={18} /> },
    { id: 'composer', label: 'Create Post', icon: <PenSquare size={18} /> },
    { id: 'queue', label: 'Posting Queue', icon: <ListOrdered size={18} />, badge: queueCount },
    { id: 'history', label: 'History', icon: <HistoryIcon size={18} /> },
    { id: 'ai', label: 'AI Writer', icon: <Sparkles size={18} /> },
    { id: 'templates', label: 'Templates', icon: <FileCode2 size={18} /> },
    { id: 'logs', label: 'Logs', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
          AI
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight">AI Group Poster</h1>
          <p className="text-[11px] text-slate-400 font-medium">Facebook Account Hub</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="opacity-70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Platform compliance badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-emerald-400" />
          <div className="text-xs">
            <div className="font-semibold text-emerald-200">100% User-Controlled</div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">
              Human approves every post. Zero bot bypass.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
