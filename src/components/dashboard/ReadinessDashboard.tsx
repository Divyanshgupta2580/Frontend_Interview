import React, { useState } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import {
  Check,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Award,
  AlertCircle,
  Cpu,
  BarChart3,
  Search,
  Code2,
  GitBranch,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

export const ReadinessDashboard: React.FC = () => {
  const { readinessData, toggleFixApplied, setActiveTab, currentUser, openInterviewModal } = usePlatformStore();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredFixes = readinessData.fixes.filter((fix) => {
    if (filterSeverity === 'all') return true;
    return fix.severity === filterSeverity;
  });

  const appliedCount = readinessData.fixes.filter((f) => f.applied).length;
  const totalFixes = readinessData.fixes.length;

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'System Architecture & Concurrency': Cpu,
    'Impact Quantification & Metrics': BarChart3,
    'ATS Semantic Keyword Coverage': Search,
    'Algorithmic Problem Space Rigor': Code2,
    'Cross-Functional & Code Ownership': GitBranch
  };

  const categoryThemes: Record<string, { iconBg: string; iconColor: string; barColor: string }> = {
    'System Architecture & Concurrency': {
      iconBg: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      barColor: 'bg-indigo-600'
    },
    'Impact Quantification & Metrics': {
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-600'
    },
    'ATS Semantic Keyword Coverage': {
      iconBg: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      barColor: 'bg-purple-600'
    },
    'Algorithmic Problem Space Rigor': {
      iconBg: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      barColor: 'bg-sky-600'
    },
    'Cross-Functional & Code Ownership': {
      iconBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      barColor: 'bg-amber-600'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* 1. Student Context & Passport Banner (Distinguished Deep Navy/Slate Card) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900/40 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-lg border border-indigo-400/40 shrink-0 shadow-xs shadow-indigo-500/30">
                {currentUser.avatarInitials}
              </div>
              {/* Active Beacon */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-white tracking-tight">
                  {currentUser.name}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-md border border-slate-700">
                  MSOT Fellow
                </span>
                <span className="text-xs font-mono font-medium text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-700/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Candidate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Target Track: <strong className="text-sky-300 font-semibold">{readinessData.targetRole}</strong> · Goal: Tier-1 Referral
              </p>
            </div>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-semibold block">Action Status</span>
              <span className="text-base font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                <span className="text-emerald-400 font-bold">{appliedCount}</span> / {totalFixes} Fixes Applied
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-semibold block">Cohort Standing</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                Top <span className="text-indigo-300">{100 - readinessData.percentile}%</span> Rank
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title & Re-Upload Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-mono font-bold flex items-center gap-1.5">
            Diagnostics Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Readiness Index & Targeted Fixes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Evaluated against 450+ verified engineering requisitions.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
          <button
            onClick={openInterviewModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm shadow-indigo-600/25"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Launch LiveKit Mock Interview</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-2xs"
          >
            <span>Upload Resume</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary KPI & Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Readiness Score Card */}
        <div className="lg:col-span-5 border border-slate-200 bg-white rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" /> Overall Readiness
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                Top {100 - readinessData.percentile}% Cohort
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 font-mono">
                {readinessData.overallScore}
              </span>
              <span className="text-2xl text-slate-400 font-light">/ 100</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
              Your profile ranks in the <strong className="text-slate-900 font-semibold">{readinessData.percentile}th percentile</strong> for senior infrastructure & backend engineering positions.
            </p>
          </div>

          {/* Sparkline Progression */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Growth Trajectory
              </span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                +{readinessData.overallScore - 62} pts since Sep
              </span>
            </div>

            <div className="h-24 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scoreFillIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="65" x2="300" y2="65" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="35" x2="300" y2="35" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                <polygon
                  fill="url(#scoreFillIndigo)"
                  points={`0,70 ${readinessData.scoreHistory
                    .map((item, index) => {
                      const x = (index / (readinessData.scoreHistory.length - 1)) * 300;
                      const y = 65 - ((item.score - 50) / 50) * 60;
                      return `${x},${y}`;
                    })
                    .join(' ')} 300,70`}
                />
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={readinessData.scoreHistory
                    .map((item, index) => {
                      const x = (index / (readinessData.scoreHistory.length - 1)) * 300;
                      const y = 65 - ((item.score - 50) / 50) * 60;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
                {readinessData.scoreHistory.map((item, index) => {
                  const x = (index / (readinessData.scoreHistory.length - 1)) * 300;
                  const y = 65 - ((item.score - 50) / 50) * 60;
                  return (
                    <g key={item.date}>
                      <circle cx={x} cy={y} r="3.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
              {readinessData.scoreHistory.map((item) => (
                <span key={item.date}>{item.date}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Competency Breakdown Visual Chart */}
        <div className="lg:col-span-7 border border-slate-200 bg-white rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Competency Breakdown vs. Benchmark
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort baseline is 73/100 across 450+ verified specifications
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs inline-block" /> Candidate
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Cohort Avg
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {readinessData.categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || Cpu;
              const theme = categoryThemes[cat.name] || {
                iconBg: 'bg-slate-100 border-slate-200',
                iconColor: 'text-slate-700',
                barColor: 'bg-indigo-600'
              };

              return (
                <div key={cat.name} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className={`p-1 rounded-md border ${theme.iconBg} ${theme.iconColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900 text-sm">{cat.score}%</span>
                      <span className="text-slate-400 text-xs">(avg {cat.benchmark}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar with Benchmark Marker */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full relative overflow-visible border border-slate-200/80">
                    <div
                      className={`h-full ${theme.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${cat.score}%` }}
                    />
                    {/* Benchmark tick indicator */}
                    <div
                      className="absolute top-[-4px] bottom-[-4px] w-[2px] bg-slate-400 z-10"
                      style={{ left: `${cat.benchmark}%` }}
                      title={`Cohort benchmark: ${cat.benchmark}%`}
                    />
                  </div>

                  <p className="text-xs text-slate-500 leading-normal pl-7">
                    {cat.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Specific Feedback Fixes Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Specific Feedback Fixes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Targeted bullet rewrites and structural optimizations. Review and apply with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-mono font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
              {appliedCount} of {totalFixes} Applied
            </span>

            {/* Filter buttons */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-xs font-semibold">
              {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Short, Targeted Fix Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredFixes.map((fix) => {
            const isHigh = fix.severity === 'high';
            const isMedium = fix.severity === 'medium';

            const severityBadge = isHigh
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : isMedium
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={fix.id}
                className={`border rounded-2xl p-5 sm:p-6 transition-all shadow-xs ${
                  fix.applied
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                      <span className="uppercase font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {fix.category}
                      </span>
                      <span className={`capitalize px-2.5 py-0.5 rounded-full border text-xs font-semibold ${severityBadge}`}>
                        {fix.severity} Priority
                      </span>
                      <span className="text-slate-500 font-medium">{fix.location}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-0.5">
                      {fix.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleFixApplied(fix.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all self-start sm:self-auto shrink-0 shadow-xs ${
                      fix.applied
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {fix.applied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Applied (+4 pts)</span>
                      </>
                    ) : (
                      <span>Apply Revision</span>
                    )}
                  </button>
                </div>

                {/* Diff Comparison: Muted Rose (Before) vs Fresh Emerald (After) */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                  {/* Before */}
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70">
                    <span className="text-xs font-mono text-rose-700 font-bold uppercase tracking-wider block mb-1">
                      Current Draft
                    </span>
                    <p className="text-rose-950 line-through decoration-rose-400 font-medium leading-relaxed">
                      "{fix.beforeText}"
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/80 shadow-2xs">
                    <span className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-700" /> Recommended Revision
                    </span>
                    <p className="text-emerald-950 font-medium leading-relaxed">
                      "{fix.afterText}"
                    </p>
                  </div>
                </div>

                {/* Rationale explanation */}
                <div className="mt-3 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100 flex items-start gap-1.5">
                  <strong className="text-slate-800 font-semibold shrink-0">Impact:</strong>
                  <span>{fix.rationale}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
