import React from 'react';
import { usePlatformStore, ActiveTab } from '../../store/usePlatformStore';
import { User, Shield, Layers, MessageSquare, Kanban, Briefcase, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    openAuthModal,
    switchRole
  } = usePlatformStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Readiness Dashboard', icon: Layers },
    { id: 'chat', label: 'Review & Chat', icon: MessageSquare },
    { id: 'tracker', label: 'Application Tracker', icon: Kanban },
    { id: 'admin-jobs', label: 'MSOT Job Board', icon: Briefcase }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wider rounded-lg shadow-xs shadow-indigo-500/20">
              M
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight flex items-center gap-1.5">
                MSOT Platform
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" title="System Online" />
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Candidate & Job Board Shell
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Auth / Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick role toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100/90 text-xs">
            <button
              onClick={() => switchRole('student')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                currentUser.role === 'student'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-3 py-1 rounded-md transition-all font-semibold ${
                currentUser.role === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Profile / Supabase Session trigger */}
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg transition-all bg-white hover:bg-slate-50 text-left group shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center bg-indigo-600">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 font-medium capitalize leading-tight">
                {currentUser.role} Session
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto bg-white/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
