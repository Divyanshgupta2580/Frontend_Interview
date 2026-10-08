import React, { useState } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import { AdminJobPosting } from '../../types';
import { MOCK_APPLICANTS_POOL } from '../../data/mockData';
import {
  Briefcase,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Layers,
  ChevronDown,
  X,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';

export const MSOTAdminBoard: React.FC = () => {
  const {
    adminJobs,
    addAdminJob,
    toggleAdminJobStatus,
    deleteAdminJob,
    currentUser,
    switchRole
  } = usePlatformStore();

  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [type, setType] = useState<'Full-time' | 'Internship' | 'Co-op' | 'Contract'>('Full-time');
  const [minReadinessScore, setMinReadinessScore] = useState(80);
  const [deadline, setDeadline] = useState('Nov 30, 2026');
  const [description, setDescription] = useState('');
  const [reqInput, setReqInput] = useState('');

  const filteredJobs = adminJobs.filter((job) => {
    if (filterType === 'all') return true;
    return job.status === filterType;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const requirements = reqInput
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    addAdminJob({
      title: title.trim(),
      company: company.trim(),
      department: department.trim() || 'Engineering',
      location: location.trim(),
      type,
      minReadinessScore: Number(minReadinessScore),
      status: 'active',
      deadline,
      description: description.trim() || 'Role registered via MSOT Administrative Portal.',
      requirements: requirements.length > 0 ? requirements : ['Strong foundations in systems & full-stack development']
    });

    // Reset
    setTitle('');
    setCompany('');
    setDepartment('');
    setDescription('');
    setReqInput('');
    setIsPostJobModalOpen(false);
  };

  const totalApplicants = adminJobs.reduce((acc, j) => acc + j.applicantsCount, 0);
  const activeJobsCount = adminJobs.filter((j) => j.status === 'active').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-indigo-600 font-mono font-bold">
              Administrative Console
            </span>
            {currentUser.role !== 'admin' && (
              <span className="text-[11px] text-slate-500 font-mono">
                · Viewing as {currentUser.role} (
                <button
                  onClick={() => switchRole('admin')}
                  className="underline hover:text-indigo-600 font-semibold"
                >
                  Switch to Admin
                </button>
                )
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            MSOT Requisition & Partner Job Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish vetted engineering roles, set candidate minimum readiness thresholds, and route cohort referrals.
          </p>
        </div>

        <button
          onClick={() => setIsPostJobModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Requisition</span>
        </button>
      </div>

      {/* Admin KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-indigo-200/80 rounded-2xl p-6 bg-gradient-to-br from-indigo-50/50 to-white shadow-xs space-y-1">
          <span className="text-xs text-indigo-700 font-mono uppercase tracking-wider font-semibold">
            Active Job Postings
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 font-mono">
            {activeJobsCount}
          </div>
          <p className="text-xs text-slate-500">
            Across {adminJobs.length} total managed requisitions
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider font-semibold">
            Cohort Applicants Tracked
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {totalApplicants}
          </div>
          <p className="text-xs text-slate-500">
            Aggregated across verified MSOT fellows
          </p>
        </div>

        <div className="border border-emerald-200/80 rounded-2xl p-6 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs space-y-1">
          <span className="text-xs text-emerald-800 font-mono uppercase tracking-wider font-semibold">
            Average Requisition Threshold
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            80.5 <span className="text-base text-slate-400 font-medium">pts</span>
          </div>
          <p className="text-xs text-slate-500">
            Minimum required readiness index for referral
          </p>
        </div>
      </div>

      {/* Job Requisitions Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Managed Requisitions
            </h2>
            <p className="text-xs text-slate-500">
              Live roles accepting MSOT candidate submissions
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-xs">
            {(['all', 'active', 'draft', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterType(status)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  filterType === status
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const statusBadge = job.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
              : job.status === 'draft'
              ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
              : 'bg-slate-100 text-slate-600 border-slate-200 font-medium';

            return (
              <div
                key={job.id}
                className="rounded-2xl p-6 transition-all shadow-xs hover:border-slate-300 border border-slate-200 bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs ${statusBadge}`}>
                        ● {job.status.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{job.company}</span>
                      <span className="text-slate-500 font-medium">📍 {job.location}</span>
                      <span className="text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{job.type}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {job.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      {job.description}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-xs uppercase font-mono tracking-wider text-slate-500 block font-semibold">
                          Core Competencies:
                        </span>
                        <ul className="text-xs sm:text-sm text-slate-700 space-y-1">
                          {job.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-baseline gap-2">
                              <span className="text-indigo-500 font-bold text-xs">↳</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Threshold & Action Controls */}
                  <div className="flex flex-col md:items-end justify-between self-stretch shrink-0 space-y-4">
                    <div className="md:text-right space-y-1">
                      <div className="text-xs font-mono text-indigo-900 bg-indigo-50/80 p-2 rounded-xl border border-indigo-200">
                        Minimum Threshold: <strong className="text-indigo-600 font-bold text-sm">{job.minReadinessScore}+ pts</strong>
                      </div>
                      <div className="text-xs text-slate-600 font-medium font-mono pt-1">
                        👥 {job.applicantsCount} candidate applicants
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Deadline: {job.deadline}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => toggleAdminJobStatus(job.id)}
                        className={`text-xs px-3.5 py-1.5 rounded-lg border font-semibold transition-all shadow-xs ${
                          job.status === 'active'
                            ? 'border-slate-200 text-slate-800 hover:bg-slate-100'
                            : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {job.status === 'active' ? 'Close Requisition' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => deleteAdminJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors border border-slate-200"
                        title="Delete Posting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Talent Pool / Cohort Inspection */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Cohort Candidate Readiness Index
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time status of candidates meeting partner role criteria
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono text-xs font-bold">
              <tr>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4">Target Track</th>
                <th className="py-3.5 px-4">Readiness Index</th>
                <th className="py-3.5 px-4">Audit Status</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_APPLICANTS_POOL.map((c) => {
                const statusBadge = c.status.includes('Referral')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                  : c.status.includes('Interviewing')
                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                  : 'bg-blue-50 text-blue-700 border-blue-200 font-bold';

                return (
                  <tr key={c.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-950">{c.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{c.target}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-indigo-600 font-bold text-sm">{c.score}</span> / 100
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium">
                      {c.topFixesPending === 0 ? (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ All cleared</span>
                      ) : (
                        <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">⚠ {c.topFixesPending} pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-mono ${statusBadge}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-lg max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Publish New Job Requisition
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Visible to MSOT fellows matching readiness criteria
                </p>
              </div>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Company / Partner *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anthropic, Datadog"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Platform Architecture"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Employment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Co-op">Co-op</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Min. Readiness Score</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={minReadinessScore}
                    onChange={(e) => setMinReadinessScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of scope, mission, and team charter..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Key Requirements (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Proficiency in Go or Rust&#10;Experience with Kubernetes operators&#10;System design fundamentals"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md outline-hidden focus:border-neutral-900 font-mono text-[11px] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 transition-colors"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
