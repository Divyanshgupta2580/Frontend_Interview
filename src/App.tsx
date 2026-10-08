import React from 'react';
import { usePlatformStore } from './store/usePlatformStore';
import { Navbar } from './components/layout/Navbar';
import { ReadinessDashboard } from './components/dashboard/ReadinessDashboard';
import { ChatInterface } from './components/chat/ChatInterface';
import { ApplicationTracker } from './components/tracker/ApplicationTracker';
import { MSOTAdminBoard } from './components/admin/MSOTAdminBoard';
import { AuthModal } from './components/auth/AuthModal';
import { BackgroundCanvas } from './components/layout/BackgroundCanvas';

export default function App() {
  const { activeTab } = usePlatformStore();

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Dynamic Engineered Background */}
      <BackgroundCanvas />

      {/* Top Application Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {activeTab === 'dashboard' && <ReadinessDashboard />}
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'tracker' && <ApplicationTracker />}
        {activeTab === 'admin-jobs' && <MSOTAdminBoard />}
      </main>

      {/* Supabase Authentication & Role Switcher Modal */}
      <AuthModal />

      {/* Platform Shell Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/80 backdrop-blur-md py-6 mt-16 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MSOT Core Platform Shell</span>
            <span aria-hidden="true">·</span>
            <span>Independent JSON Architecture</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-xs text-indigo-600 font-semibold">Next.js & Supabase Ready</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
            <span>Student & Admin RBAC</span>
            <span>·</span>
            <span>Zustand State Store</span>
            <span>·</span>
            <span className="text-indigo-600 font-medium">Distinct Professional Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
