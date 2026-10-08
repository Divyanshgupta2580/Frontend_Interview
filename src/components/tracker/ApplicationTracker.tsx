import React, { useState } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import { ApplicationStage, JobApplication } from '../../types';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Search,
  Building,
  MapPin,
  Calendar,
  X,
  Bookmark,
  Send,
  MessageSquare,
  Trophy,
  DollarSign
} from 'lucide-react';

const COLUMNS: {
  id: ApplicationStage;
  label: string;
  badgeStyle: string;
  headerIconStyle: string;
  containerStyle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'saved',
    label: 'Saved & Target',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    headerIconStyle: 'text-slate-500',
    containerStyle: 'border-t-4 border-t-slate-400 bg-slate-50/60 border-slate-200',
    icon: Bookmark
  },
  {
    id: 'applied',
    label: 'Applied',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    headerIconStyle: 'text-blue-600',
    containerStyle: 'border-t-4 border-t-blue-500 bg-blue-50/25 border-blue-100/80',
    icon: Send
  },
  {
    id: 'interviewing',
    label: 'Interviewing',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    headerIconStyle: 'text-amber-600',
    containerStyle: 'border-t-4 border-t-amber-500 bg-amber-50/25 border-amber-100/80',
    icon: MessageSquare
  },
  {
    id: 'offered',
    label: 'Offered',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    headerIconStyle: 'text-emerald-600',
    containerStyle: 'border-t-4 border-t-emerald-500 bg-emerald-50/25 border-emerald-100/80',
    icon: Trophy
  }
];

export const ApplicationTracker: React.FC = () => {
  const {
    applications,
    moveApplicationStage,
    addApplication,
    deleteApplication,
    setActiveTab
  } = usePlatformStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStage>('saved');
  const [newNotes, setNewNotes] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');

  const filteredApps = applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.location.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    addApplication({
      company: newCompany.trim(),
      role: newRole.trim(),
      location: newLocation.trim() || 'Remote',
      salary: newSalary.trim() || '$160k - $190k',
      status: newStatus,
      matchScore: Math.floor(Math.random() * 15) + 80,
      appliedDate: newStatus !== 'saved' ? 'Today' : undefined,
      notes: newNotes.trim() || 'Tracked through MSOT Shell',
      jobUrl: newJobUrl.trim() || undefined
    });

    setNewCompany('');
    setNewRole('');
    setNewLocation('');
    setNewSalary('');
    setNewNotes('');
    setNewJobUrl('');
    setIsAddModalOpen(false);
  };

  const getNextStage = (current: ApplicationStage): ApplicationStage | null => {
    const sequence: ApplicationStage[] = ['saved', 'applied', 'interviewing', 'offered'];
    const idx = sequence.indexOf(current);
    if (idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const getPrevStage = (current: ApplicationStage): ApplicationStage | null => {
    const sequence: ApplicationStage[] = ['saved', 'applied', 'interviewing', 'offered'];
    const idx = sequence.indexOf(current);
    if (idx > 0) return sequence[idx - 1];
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-mono font-bold">
            Pipeline Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track and advance candidate applications across stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 outline-hidden focus:border-indigo-600 transition-colors w-48 sm:w-64 font-medium"
            />
          </div>

          {/* Add Application Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((column) => {
          const colApps = filteredApps.filter((a) => a.status === column.id);
          const Icon = column.icon;

          return (
            <div
              key={column.id}
              className={`border rounded-2xl p-3.5 space-y-3 shadow-2xs transition-all ${column.containerStyle}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className={column.headerIconStyle}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-slate-800">
                    {column.label}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${column.badgeStyle}`}>
                  {colApps.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 min-h-[440px]">
                {colApps.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    No positions in {column.label}
                  </div>
                ) : (
                  colApps.map((app) => {
                    const nextStage = getNextStage(app.status);
                    const prevStage = getPrevStage(app.status);

                    const matchBadge = app.matchScore >= 90
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                      : 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';

                    return (
                      <div
                        key={app.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 space-y-3 transition-all shadow-2xs group"
                      >
                        {/* Company & Role */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-bold text-slate-900 leading-tight block">
                              {app.company}
                            </span>
                            <span className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                              {app.role}
                            </span>
                          </div>
                          <span className={`text-xs font-mono shrink-0 px-2 py-0.5 rounded border ${matchBadge}`}>
                            {app.matchScore}%
                          </span>
                        </div>

                        {/* Location & Salary */}
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <p>{app.location}</p>
                          {app.salary && (
                            <p className="font-mono text-slate-700 font-medium">{app.salary}</p>
                          )}
                        </div>

                        {/* Interview Round Alert Box */}
                        {app.interviewRound && (
                          <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 font-mono font-medium">
                            ↳ {app.interviewRound}
                          </div>
                        )}

                        {app.notes && !app.interviewRound && (
                          <p className="text-xs text-zinc-500 italic line-clamp-2">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Movement Controls */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {prevStage && (
                              <button
                                onClick={() => moveApplicationStage(app.id, prevStage)}
                                className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                                title={`Move back to ${prevStage}`}
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStage && (
                              <button
                                onClick={() => moveApplicationStage(app.id, nextStage)}
                                className="flex items-center gap-1 text-xs px-2.5 py-1 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 rounded-md font-semibold text-slate-700 transition-all bg-white shadow-2xs"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-50 transition-colors"
                                title="Open Job Requisition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="p-1 text-zinc-300 hover:text-rose-600 rounded transition-colors"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Position Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                Track New Position
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI, Stripe, Linear"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Engineer · Platform"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Remote / San Francisco"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$170k - $200k"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Stage Column</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStage)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 bg-white font-medium"
                >
                  <option value="saved">Saved & Target</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Job Spec URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/..."
                  value={newJobUrl}
                  onChange={(e) => setNewJobUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Notes / Strategy</label>
                <textarea
                  rows={2}
                  placeholder="Key requirements, referral contact, or prep focus..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg outline-hidden focus:border-zinc-900 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-xs"
                >
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
