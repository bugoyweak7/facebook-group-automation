import React from 'react';
import { Sidebar, TabType } from './Sidebar';
import { Header } from './Header';
import { QueueState } from '../../types/queue';

interface DashboardLayoutProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  title: string;
  description?: string;
  queueCount: number;
  queueState: QueueState;
  hasGroups: boolean;
  onStartQueue: () => void;
  onPauseQueue: () => void;
  onResumeQueue: () => void;
  onOpenOnboarding: () => void;
  onLoadDemoData: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  title,
  description,
  queueCount,
  queueState,
  hasGroups,
  onStartQueue,
  onPauseQueue,
  onResumeQueue,
  onOpenOnboarding,
  onLoadDemoData,
  children,
}) => {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        queueCount={queueCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          description={description}
          queueState={queueState}
          hasGroups={hasGroups}
          onStartQueue={onStartQueue}
          onPauseQueue={onPauseQueue}
          onResumeQueue={onResumeQueue}
          onOpenOnboarding={onOpenOnboarding}
          onLoadDemoData={onLoadDemoData}
        />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
