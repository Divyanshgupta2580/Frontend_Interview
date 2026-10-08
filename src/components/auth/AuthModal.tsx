import React, { useState } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import { X, Check, Key, Shield, User, ExternalLink, Code } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    isAuthModalOpen,
    closeAuthModal,
    switchRole
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'switch' | 'supabase-spec'>('switch');

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-lg max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Supabase Authentication Session
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Role-based access control (RBAC) & Persona switcher
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 border-b border-neutral-100 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 transition-colors relative ${
              activeTab === 'switch'
                ? 'text-neutral-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Active Persona
          </button>
          <button
            onClick={() => setActiveTab('supabase-spec')}
            className={`pb-2.5 transition-colors relative ${
              activeTab === 'supabase-spec'
                ? 'text-neutral-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Supabase Auth Contract
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'switch' ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Toggle between the verified <span className="font-semibold text-neutral-900">Student</span> and <span className="font-semibold text-neutral-900">Admin</span> personas. The platform shell automatically adjusts permission boundaries and view access.
              </p>

              {/* Student Role Card */}
              <div
                onClick={() => {
                  switchRole('student');
                  closeAuthModal();
                }}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  currentUser.role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                      AC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">Alexandre Chen</span>
                        <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono font-medium">student</span>
                      </div>
                      <p className="text-xs text-slate-500">alex.chen@msot.edu</p>
                    </div>
                  </div>
                  {currentUser.role === 'student' && (
                    <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-600" /> Active
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Target: Full Stack & Infra</span>
                  <span className="font-semibold text-indigo-700">Readiness: {currentUser.readinessScore ?? 84}/100</span>
                </div>
              </div>

              {/* Admin Role Card */}
              <div
                onClick={() => {
                  switchRole('admin');
                  closeAuthModal();
                }}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  currentUser.role === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                      SL
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">Sarah Lindqvist</span>
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono font-medium">admin</span>
                      </div>
                      <p className="text-xs text-slate-500">sarah.lindqvist@msot.org</p>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-600" /> Active
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Role: MSOT Directorate</span>
                  <span className="text-slate-500">Full Job & Analytics</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-neutral-600 leading-relaxed">
                Integration format for Next.js App Router and Supabase Auth JWT claims:
              </div>
              <div className="bg-neutral-950 text-neutral-200 p-3.5 rounded-md font-mono text-[11px] overflow-x-auto leading-relaxed border border-neutral-800">
                <span className="text-neutral-500">// lib/supabase/auth.ts</span>
                <br />
                {`const { data: { user } } = await supabase.auth.getUser();`}
                <br />
                <br />
                <span className="text-neutral-500">// Role extracted from app_metadata or user_metadata:</span>
                <br />
                {`const role = user?.app_metadata?.role ?? 'student';`}
                <br />
                {`// RLS Policy in Supabase SQL:`}
                <br />
                {`CREATE POLICY "Admins full job access"`}
                <br />
                {`  ON msot_jobs FOR ALL`}
                <br />
                {`  USING (auth.jwt() ->> 'role' = 'admin');`}
              </div>
              <div className="text-[11px] text-neutral-500">
                Ready for drop-in with <code>@supabase/ssr</code> cookie handlers.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Session ID: <code className="font-mono text-neutral-700">sess_msot_{currentUser.role}</code></span>
          <button
            onClick={closeAuthModal}
            className="px-3 py-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 font-medium text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
