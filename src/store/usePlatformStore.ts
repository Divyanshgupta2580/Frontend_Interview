import { create } from 'zustand';
import {
  UserProfile,
  ReadinessMetrics,
  ChatMessage,
  JobApplication,
  AdminJobPosting,
  ApplicationStage,
  Attachment
} from '../types';
import {
  MOCK_STUDENT,
  MOCK_ADMIN,
  INITIAL_READINESS_DATA,
  INITIAL_CHAT_MESSAGES,
  INITIAL_APPLICATIONS,
  INITIAL_ADMIN_JOBS
} from '../data/mockData';

export type ActiveTab = 'dashboard' | 'chat' | 'tracker' | 'admin-jobs';

interface PlatformStore {
  // Authentication & Session
  currentUser: UserProfile;
  isAuthModalOpen: boolean;
  switchRole: (role: 'student' | 'admin') => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Chat State
  messages: ChatMessage[];
  pendingAttachments: Attachment[];
  linkInput: string;
  isGeneratingResponse: boolean;
  setLinkInput: (url: string) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  sendMessage: (content: string) => void;

  // Readiness Metrics & Feedback Fixes
  readinessData: ReadinessMetrics;
  toggleFixApplied: (fixId: string) => void;

  // Application Tracker (Kanban)
  applications: JobApplication[];
  moveApplicationStage: (id: string, newStage: ApplicationStage) => void;
  addApplication: (app: Omit<JobApplication, 'id'>) => void;
  deleteApplication: (id: string) => void;

  // MSOT Admin Job Board
  adminJobs: AdminJobPosting[];
  addAdminJob: (job: Omit<AdminJobPosting, 'id' | 'applicantsCount' | 'postedDate'>) => void;
  toggleAdminJobStatus: (id: string) => void;
  deleteAdminJob: (id: string) => void;
}

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  // Authentication
  currentUser: MOCK_STUDENT,
  isAuthModalOpen: false,
  switchRole: (role) => {
    if (role === 'admin') {
      set({
        currentUser: MOCK_ADMIN,
        activeTab: 'admin-jobs'
      });
    } else {
      set({
        currentUser: MOCK_STUDENT,
        activeTab: 'dashboard'
      });
    }
  },
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Chat State
  messages: INITIAL_CHAT_MESSAGES,
  pendingAttachments: [],
  linkInput: '',
  isGeneratingResponse: false,
  setLinkInput: (url) => set({ linkInput: url }),
  addAttachment: (attachment) => {
    set((state) => ({
      pendingAttachments: [...state.pendingAttachments, attachment]
    }));
  },
  removeAttachment: (id) => {
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((att) => att.id !== id)
    }));
  },
  sendMessage: (content) => {
    const { pendingAttachments, messages } = get();
    if (!content.trim() && pendingAttachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: content.trim() || 'Attached documents and links for evaluation.',
      attachments: [...pendingAttachments]
    };

    set({
      messages: [...messages, userMessage],
      pendingAttachments: [],
      linkInput: '',
      isGeneratingResponse: true
    });

    // Simulate structured platform intelligence response
    setTimeout(() => {
      const hasPdf = userMessage.attachments?.some((a) => a.type === 'pdf');
      const hasLink = userMessage.attachments?.some((a) => a.type === 'link');

      let replyContent = `I have received and evaluated your input. `;
      if (hasPdf && hasLink) {
        replyContent += `Cross-referencing your PDF resume against the external job specifications reveals an 87% semantic match. To elevate your application into the top 5% of candidates, emphasize concurrent data pipelines and add specific benchmark latency percentiles.`;
      } else if (hasPdf) {
        replyContent += `Your uploaded PDF document has been parsed through our ATS simulation engine. The formatting conforms to single-column ATS standards. We detected 3 experience bullets that would benefit from concrete metrics.`;
      } else if (hasLink) {
        replyContent += `Extracted job criteria and tech stack from the provided URL. We recommend highlighting hands-on Go / Rust distributed consensus systems in your summary.`;
      } else {
        replyContent += `Your query has been logged. Review the suggested feedback fixes in your Dashboard to increase your readiness score by +3 points.`;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: replyContent,
        readinessDelta: +2,
        actionItems: [
          'Verify updated bullet metrics in Readiness Dashboard',
          'Ensure contact details and LinkedIn URL are unformatted plain text',
          'Submit application before the priority deadline'
        ]
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isGeneratingResponse: false
      }));
    }, 1100);
  },

  // Readiness Metrics
  readinessData: INITIAL_READINESS_DATA,
  toggleFixApplied: (fixId) => {
    set((state) => {
      const updatedFixes = state.readinessData.fixes.map((fix) => {
        if (fix.id === fixId) {
          return { ...fix, applied: !fix.applied };
        }
        return fix;
      });

      // Calculate new score based on applied fixes
      const appliedCount = updatedFixes.filter((f) => f.applied).length;
      const baseScore = 80;
      const computedScore = Math.min(98, baseScore + appliedCount * 4);

      return {
        readinessData: {
          ...state.readinessData,
          overallScore: computedScore,
          fixes: updatedFixes
        }
      };
    });
  },

  // Applications Tracker (Kanban)
  applications: INITIAL_APPLICATIONS,
  moveApplicationStage: (id, newStage) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status: newStage } : app
      )
    }));
  },
  addApplication: (newApp) => {
    const id = `app-${Date.now()}`;
    set((state) => ({
      applications: [{ ...newApp, id }, ...state.applications]
    }));
  },
  deleteApplication: (id) => {
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id)
    }));
  },

  // Admin Job Board
  adminJobs: INITIAL_ADMIN_JOBS,
  addAdminJob: (jobData) => {
    const newJob: AdminJobPosting = {
      ...jobData,
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    set((state) => ({
      adminJobs: [newJob, ...state.adminJobs]
    }));
  },
  toggleAdminJobStatus: (id) => {
    set((state) => ({
      adminJobs: state.adminJobs.map((job) =>
        job.id === id
          ? { ...job, status: job.status === 'active' ? 'closed' : 'active' }
          : job
      )
    }));
  },
  deleteAdminJob: (id) => {
    set((state) => ({
      adminJobs: state.adminJobs.filter((job) => job.id !== id)
    }));
  }
}));
