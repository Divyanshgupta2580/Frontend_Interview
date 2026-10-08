export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  affiliation?: string;
  targetRole?: string;
  readinessScore?: number;
  avatarInitials: string;
}

export interface Attachment {
  id: string;
  type: 'pdf' | 'link';
  name: string;
  url: string;
  size?: string;
  timestamp: string;
}

export interface SpecificFix {
  id: string;
  category: 'ATS Format' | 'Impact Metrics' | 'Technical Depth' | 'Keywords';
  severity: 'high' | 'medium' | 'low';
  title: string;
  location: string;
  beforeText: string;
  afterText: string;
  rationale: string;
  applied: boolean;
}

export interface ReadinessCategory {
  name: string;
  score: number;
  maxScore: number;
  benchmark: number; // class or cohort average
  summary: string;
}

export interface ReadinessMetrics {
  overallScore: number;
  percentile: number;
  targetRole: string;
  lastUpdated: string;
  categories: ReadinessCategory[];
  scoreHistory: { date: string; score: number }[];
  fixes: SpecificFix[];
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  attachments?: Attachment[];
  readinessDelta?: number;
  actionItems?: string[];
}

export type ApplicationStage = 'saved' | 'applied' | 'interviewing' | 'offered' | 'archived';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  status: ApplicationStage;
  appliedDate?: string;
  deadline?: string;
  matchScore: number;
  jobUrl?: string;
  notes?: string;
  interviewRound?: string;
}

export interface AdminJobPosting {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Co-op' | 'Contract';
  minReadinessScore: number;
  applicantsCount: number;
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
}
