import { UserProfile, ReadinessMetrics, ChatMessage, JobApplication, AdminJobPosting } from '../types';

export const MOCK_STUDENT: UserProfile = {
  id: 'usr_student_01',
  name: 'Alexandre Chen',
  email: 'alex.chen@msot.edu',
  role: 'student',
  affiliation: 'MSOT Fellow · Cohort 2026',
  targetRole: 'Founding Infrastructure Engineer',
  readinessScore: 84,
  avatarInitials: 'AC'
};

export const MOCK_ADMIN: UserProfile = {
  id: 'usr_admin_01',
  name: 'Sarah Lindqvist',
  email: 'sarah.lindqvist@msot.org',
  role: 'admin',
  affiliation: 'MSOT Program Lead & Career Directorate',
  avatarInitials: 'SL'
};

export const INITIAL_READINESS_DATA: ReadinessMetrics = {
  overallScore: 84,
  percentile: 91,
  targetRole: 'Full Stack & Infrastructure Systems',
  lastUpdated: 'Today at 09:42',
  scoreHistory: [
    { date: 'Sep 12', score: 62 },
    { date: 'Sep 19', score: 71 },
    { date: 'Sep 26', score: 78 },
    { date: 'Oct 03', score: 81 },
    { date: 'Oct 07', score: 84 }
  ],
  categories: [
    {
      name: 'System Architecture & Concurrency',
      score: 88,
      maxScore: 100,
      benchmark: 72,
      summary: 'Demonstrated deep understanding of distributed transactions and rate limiting.'
    },
    {
      name: 'Impact Quantification & Metrics',
      score: 79,
      maxScore: 100,
      benchmark: 68,
      summary: 'Strong project velocity signals, but two experience entries lack concrete baseline percentages.'
    },
    {
      name: 'ATS Semantic Keyword Coverage',
      score: 92,
      maxScore: 100,
      benchmark: 76,
      summary: '94% alignment with Tier-1 infrastructure and cloud platform job descriptions.'
    },
    {
      name: 'Algorithmic Problem Space Rigor',
      score: 81,
      maxScore: 100,
      benchmark: 70,
      summary: 'Good data structures balance; recommended highlighting memory optimization trade-offs.'
    },
    {
      name: 'Cross-Functional & Code Ownership',
      score: 86,
      maxScore: 100,
      benchmark: 74,
      summary: 'Clear ownership from RFC draft through canary deployments.'
    }
  ],
  fixes: [
    {
      id: 'fix-1',
      category: 'Impact Metrics',
      severity: 'high',
      title: 'Add concrete p99 latency metric',
      location: 'Vertex Labs · Bullet 2',
      beforeText: 'Optimized queries and backend caching, reducing load times for users.',
      afterText: 'Cut p99 latency by 43% (380ms → 216ms) across 180k daily active users.',
      rationale: 'Replaces vague claims with empirical proof of engineering ownership.',
      applied: false
    },
    {
      id: 'fix-2',
      category: 'ATS Format',
      severity: 'high',
      title: 'Flatten dual-column skills layout',
      location: 'Technical Skills Section',
      beforeText: '[Col 1: Languages] [Col 2: Frameworks & Cloud Tools]',
      afterText: 'Languages: Go, TypeScript, Rust · Systems: K8s, Kafka, Docker · Cloud: AWS',
      rationale: 'Prevents ATS parsers (Workday, Greenhouse) from scrambling skill tokens.',
      applied: true
    },
    {
      id: 'fix-3',
      category: 'Technical Depth',
      severity: 'medium',
      title: 'Specify network partition handling in Raft',
      location: 'Projects · Distributed KV Store',
      beforeText: 'Built a distributed KV store using Raft consensus in Go.',
      afterText: 'Implemented Raft consensus handling network partitions and <50ms leader failovers.',
      rationale: 'Demonstrating failure edge cases signals production-level engineering depth.',
      applied: false
    },
    {
      id: 'fix-4',
      category: 'Keywords',
      severity: 'low',
      title: 'Include OpenTelemetry keyword tokens',
      location: 'Projects · Infrastructure',
      beforeText: 'Monitored backend servers and deployed using GitHub Actions.',
      afterText: 'Instrumented OpenTelemetry traces and automated canary rollouts via ArgoCD.',
      rationale: 'Aligns directly with modern cloud platform recruiter search queries.',
      applied: false
    }
  ]
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    timestamp: '09:15',
    content: "Welcome, Alex. I have parsed your profile and target criteria for Platform & Infrastructure roles. You can drag and drop your updated PDF resume, or enter job posting and GitHub repository links below for precision gap analysis.",
    actionItems: [
      'Upload latest Resume / CV (PDF)',
      'Paste Job Description URL to compute fit score',
      'Benchmark against MSOT Cohort 2026'
    ]
  },
  {
    id: 'msg-2',
    sender: 'student',
    timestamp: '09:24',
    content: "Here is my latest resume draft and the target job requisition for the Cloud Platform Engineer role at Linear Labs.",
    attachments: [
      {
        id: 'att-1',
        type: 'pdf',
        name: 'Alexandre_Chen_Resume_2026.pdf',
        url: '#',
        size: '142 KB',
        timestamp: '09:24'
      },
      {
        id: 'att-2',
        type: 'link',
        name: 'linearlabs.com/careers/platform-eng-l4',
        url: 'https://linearlabs.com/careers/platform-eng-l4',
        timestamp: '09:24'
      }
    ]
  },
  {
    id: 'msg-3',
    sender: 'assistant',
    timestamp: '09:25',
    content: "Analysis completed. Your profile scores 84 / 100 for the Linear Labs requisition. Your core systems background in Go and distributed consensus is a strong differentiator. However, two high-impact adjustments are needed before submitting:\n\n1. Bullet 2 under Vertex Labs relies on vague phrasing (\"significantly reducing\"). Replace this with your empirical p99 latency numbers.\n2. Add OpenTelemetry and Prometheus keywords to align with their core observability requirement.\n\nI have added these specific fixes to your Readiness Dashboard.",
    readinessDelta: +3,
    actionItems: [
      'Review high-priority metric fix in Dashboard',
      'Re-export PDF with linear layout structure',
      'Move Linear Labs to "Applied" once submitted'
    ]
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    company: 'Stripe',
    role: 'Infrastructure Engineer · Core Payments',
    location: 'Remote · San Francisco',
    salary: '$185k - $210k',
    status: 'interviewing',
    appliedDate: 'Sep 24, 2026',
    matchScore: 92,
    interviewRound: 'Technical Screen (Round 3)',
    jobUrl: 'https://stripe.com/jobs/infra-payments',
    notes: 'Focus on distributed systems consistency models and idempotent API architecture.'
  },
  {
    id: 'app-2',
    company: 'Linear',
    role: 'Platform & Sync Engineer',
    location: 'Remote · Global',
    salary: '$170k - $195k',
    status: 'interviewing',
    appliedDate: 'Sep 29, 2026',
    matchScore: 89,
    interviewRound: 'System Design Interview',
    jobUrl: 'https://linear.app/careers',
    notes: 'Reviewed WebSocket sync pipeline and offline-first SQLite cache mechanics.'
  },
  {
    id: 'app-3',
    company: 'Datadog',
    role: 'Software Engineer · Distributed Telemetry',
    location: 'New York, NY',
    salary: '$165k - $185k',
    status: 'applied',
    appliedDate: 'Oct 02, 2026',
    deadline: 'Oct 14, 2026',
    matchScore: 86,
    jobUrl: 'https://datadoghq.com/careers',
    notes: 'Submitted tailored resume with OpenTelemetry keywords highlighted.'
  },
  {
    id: 'app-4',
    company: 'Vercel',
    role: 'Edge Runtime Engineer',
    location: 'Remote',
    salary: '$175k - $200k',
    status: 'applied',
    appliedDate: 'Oct 04, 2026',
    deadline: 'Oct 18, 2026',
    matchScore: 84,
    jobUrl: 'https://vercel.com/careers',
    notes: 'Targeting Next.js server components and Node/WASM micro-runtime team.'
  },
  {
    id: 'app-5',
    company: 'Anthropic',
    role: 'Research Infrastructure Systems',
    location: 'San Francisco, CA',
    salary: '$200k - $230k',
    status: 'saved',
    deadline: 'Oct 25, 2026',
    matchScore: 78,
    jobUrl: 'https://anthropic.com/careers',
    notes: 'Need to complete PyTorch distributed training benchmark project before applying.'
  },
  {
    id: 'app-6',
    company: 'Cloudflare',
    role: 'Systems Engineer · Workers KV',
    location: 'Austin, TX / Remote',
    salary: '$160k - $180k',
    status: 'saved',
    deadline: 'Nov 01, 2026',
    matchScore: 82,
    jobUrl: 'https://cloudflare.com/careers',
    notes: 'Strong overlap with Raft consensus implementation.'
  },
  {
    id: 'app-7',
    company: 'Scale AI',
    role: 'Full Stack Infrastructure Fellow',
    location: 'San Francisco, CA',
    salary: '$170k - $190k',
    status: 'offered',
    appliedDate: 'Sep 10, 2026',
    matchScore: 94,
    interviewRound: 'Offer Decision Pending',
    jobUrl: 'https://scale.com/careers',
    notes: 'Written offer received. Deadline to decide is October 20.'
  }
];

export const INITIAL_ADMIN_JOBS: AdminJobPosting[] = [
  {
    id: 'job-101',
    title: 'Platform Infrastructure Engineer',
    company: 'Monolith Systems',
    department: 'Core Infrastructure',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    minReadinessScore: 82,
    applicantsCount: 19,
    status: 'active',
    postedDate: 'Oct 01, 2026',
    deadline: 'Nov 15, 2026',
    description: 'Lead next-generation distributed cluster scheduling and container lifecycle orchestration across hybrid multi-region cloud providers.',
    requirements: [
      'Strong proficiency in Go, Rust, or modern C++',
      'Production experience with Kubernetes operators and custom controllers',
      'Solid foundations in distributed consensus (Raft, Paxos, or etcd)'
    ]
  },
  {
    id: 'job-102',
    title: 'Full Stack Product Fellow (Cohort 2026)',
    company: 'MSOT Venture Studio',
    department: 'Incubations',
    location: 'New York, NY',
    type: 'Internship',
    minReadinessScore: 75,
    applicantsCount: 42,
    status: 'active',
    postedDate: 'Sep 28, 2026',
    deadline: 'Oct 30, 2026',
    description: 'Rapid prototyping and full-stack development for early-stage portfolio startups, building user-facing systems with modern TypeScript and PostgreSQL.',
    requirements: [
      'Hands-on expertise with Next.js App Router and TypeScript',
      'Relational database modeling with PostgreSQL or Supabase',
      'Demonstrated high velocity in building end-to-end applications'
    ]
  },
  {
    id: 'job-103',
    title: 'Distributed Systems & Database Intern',
    company: 'Aether Data',
    department: 'Storage Engine',
    location: 'Seattle, WA / Remote',
    type: 'Co-op',
    minReadinessScore: 80,
    applicantsCount: 27,
    status: 'active',
    postedDate: 'Oct 04, 2026',
    deadline: 'Nov 05, 2026',
    description: 'Work alongside principal engineers implementing LSM-tree storage engines, cache hierarchies, and zero-allocation query planning.',
    requirements: [
      'Solid systems programming knowledge (memory management, threads, async I/O)',
      'Familiarity with write-ahead logs and B-Tree / LSM indexing',
      'Clean analytical communication and benchmark profiling'
    ]
  },
  {
    id: 'job-104',
    title: 'Security Engineering Fellow',
    company: 'CipherPoint Labs',
    department: 'Application Security',
    location: 'Remote',
    type: 'Full-time',
    minReadinessScore: 85,
    applicantsCount: 11,
    status: 'draft',
    postedDate: 'Oct 06, 2026',
    deadline: 'Nov 20, 2026',
    description: 'Build automated static analysis tooling, identity verification policies, and zero-trust perimeter telemetry.',
    requirements: [
      'Application security fundamentals (OWASP, cryptographic primitives, OAuth/OIDC)',
      'Scripting and tooling development in Python or Go',
      'Experience conducting threat models and security reviews'
    ]
  }
];

export const MOCK_APPLICANTS_POOL = [
  {
    id: 'cand-1',
    name: 'Alexandre Chen',
    email: 'alex.chen@msot.edu',
    score: 84,
    status: 'Ready for Referral',
    target: 'Infrastructure & Systems',
    topFixesPending: 2
  },
  {
    id: 'cand-2',
    name: 'Elena Rostova',
    email: 'elena.r@msot.edu',
    score: 91,
    status: 'Interviewing (Stripe)',
    target: 'Full Stack & Web3',
    topFixesPending: 0
  },
  {
    id: 'cand-3',
    name: 'Marcus Vance',
    email: 'marcus.v@msot.edu',
    score: 79,
    status: 'Profile Review',
    target: 'Data & Distributed Systems',
    topFixesPending: 3
  },
  {
    id: 'cand-4',
    name: 'Priya Narang',
    email: 'priya.n@msot.edu',
    score: 88,
    status: 'Referred (Datadog)',
    target: 'Backend Platform',
    topFixesPending: 1
  }
];
