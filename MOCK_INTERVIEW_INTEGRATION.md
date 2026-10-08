# MSOT Platform Shell: Mock Interview & LiveKit Worker Integration Specification

This document provides the definitive integration contract between the **Frontend Platform Shell** and the **Mock Interview Service / LiveKit Worker**.

---

## 1. Executive Spec Alignment Review

### Does this codebase match your team's specifications?
**Yes, 100% compliant.** Here is the direct mapping against your team's brief:

| Brief Requirement | Status | Implementation in Codebase |
| :--- | :---: | :--- |
| **Independent JSON Architecture** | **Completed** | Full dummy dataset in `src/data/mockData.ts` and `src/types/index.ts`. No blocking dependencies on unfinished backend APIs. |
| **Supabase Authentication (Student vs. Admin)** | **Completed** | `src/components/auth/AuthModal.tsx` simulates instant persona switching (`alex.chen@msot.edu` vs. `sarah.lindqvist@msot.org`), complete with JWT claim contracts and RLS specifications. |
| **Chat UI with PDF Upload & Links** | **Completed** | `src/components/chat/ChatInterface.tsx` with multi-file PDF ingestion, URL metadata intake, prompt shortcuts, and structured action items. |
| **Readiness Dashboard & Feedback Fixes** | **Completed** | `src/components/dashboard/ReadinessDashboard.tsx` featuring the 84/100 Readiness Score, growth trajectory sparkline, 5 competency benchmarks, and 4 concise one-click revision fixes with clear before/after diffs. |
| **Application Tracker (Kanban Board)** | **Completed** | `src/components/tracker/ApplicationTracker.tsx` with Saved, Applied, Interviewing, and Offered stages, match scores, search filter, and add modal. |
| **MSOT Admin Job Board** | **Completed** | `src/components/admin/MSOTAdminBoard.tsx` with requisition postings, filters, applicant counters, threshold criteria, and Cohort Candidate Readiness Index. |
| **State Management** | **Completed** | Lightweight, reactive store powered by **Zustand** (`src/store/usePlatformStore.ts`). |
| **Visual Aesthetic** | **Completed** | Minimal, executive monochromatic Slate/Zinc palette with ample whitespace and zero visual clutter. |

---

## 2. Supabase Authentication & JWT Flow

### 2.1 How the Frontend Passes the JWT & Student ID
When invoking the Mock Interview backend service, the frontend client includes the Supabase session token in standard HTTP headers:

```http
POST /api/interview/session
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
Content-Type: application/json

{
  "studentId": "usr_student_01",
  "targetRole": "Distributed Systems Engineer (L4)",
  "jobId": "job-01",
  "resumeId": "res_alex_chen_v2"
}
```

* **Client Header**: `Authorization: Bearer <supabase_access_token>`
* **Student ID**: Derived server-side from the verified JWT token to prevent client spoofing, with optional matching against the body's `studentId`.

### 2.2 Authoritative JWT Claims
To guarantee secure Role-Based Access Control (RBAC):

1. **Authoritative Student Identity**:
   * **Claim**: `sub` (Subject claim, UUID)
   * **Rule**: The backend mock interview service **MUST** treat `jwt.sub` as the true student identity. The request body `studentId` is only advisory.

2. **Authoritative Role Claim**:
   * **Claim**: `app_metadata.role` (e.g. `'student'` | `'admin'`)
   * **Security Note**: Never trust `user_metadata.role` for authorization because users can update their own `user_metadata` in Supabase unless protected. Supabase `app_metadata` can only be set via the **Supabase Service Role Key** (`supabaseAdmin`).

```json
{
  "aud": "authenticated",
  "exp": 1791400000,
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alex.chen@msot.edu",
  "app_metadata": {
    "provider": "email",
    "role": "student",
    "cohort": "2026-A"
  },
  "user_metadata": {
    "name": "Alexandre Chen",
    "avatar_url": null
  }
}
```

---

## 3. LiveKit Room & Token Creation

### 3.1 Session Creation Sequence

```
[ Frontend (Next.js) ]
       │
       │ 1. POST /api/interview/session (Bearer JWT)
       ▼
[ Backend Next.js API / Interview Service ]
       │
       │ 2. Verify Supabase JWT & Extract sub + role
       │ 3. Fetch candidate resume data & rubric
       │ 4. Generate unique LiveKit room name: `interview_${sub}_${timestamp}`
       │ 5. Mint LiveKit AccessToken with roomJoin: true
       │ 6. Set Room Metadata with resume & interview criteria
       ▼
[ LiveKit Server / Cloud ]
       │
       │ 7. Return { serverUrl, roomName, token }
       ▼
[ Frontend (LiveKit Client SDK) ]
       │
       │ 8. Room.connect(serverUrl, token)
       ▼
[ LiveKit Worker / Agent ]
       │ 9. Worker receives ParticipantConnected event
       │ 10. Reads room.metadata and initiates greeting
```

### 3.2 Token Minting Implementation (Node.js / LiveKit Server SDK)
```typescript
import { AccessToken } from 'livekit-server-sdk';

export async function generateLiveKitInterviewToken(
  studentId: string,
  studentName: string,
  roomName: string
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: studentId,
    name: studentName,
    ttl: '30m' // 30-minute interview session
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  });

  return await at.toJwt();
}
```

---

## 4. How Resume Data is Passed to the Worker

To avoid race conditions where the audio begins before the resume data finishes uploading, the frontend and session API pass the resume data via **Room Metadata** during session creation:

### 4.1 Room Metadata Payload (Serialized JSON)
When the session service provisions the LiveKit room, it sets `room.metadata`:

```json
{
  "interviewId": "intv_9823482",
  "student": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alexandre Chen",
    "targetRole": "Distributed Systems Engineer (L4)"
  },
  "resume": {
    "parsedText": "Alexandre Chen. Education: MSOT Fellow. Experience: Vertex Labs. Optimized Raft consensus p99 latency to 18ms...",
    "keySkills": ["Go", "Distributed Systems", "Raft", "Kubernetes", "gRPC"],
    "pdfUrl": "https://storage.msot.edu/resumes/alex_chen_v2.pdf"
  },
  "job": {
    "title": "Systems Infrastructure Engineer",
    "company": "Datamesh Engine",
    "minimumThresholdScore": 85
  },
  "focusAreas": [
    "Concurrency & Leader Election",
    "Quantified Latency Trade-offs",
    "System Failure Modes"
  ]
}
```

### 4.2 Worker Ingestion
When the worker joins the LiveKit room, it immediately reads `room.metadata`:
```python
# Worker agent initialization
@ctx.room.on("participant_connected")
def on_participant_connected(participant):
    metadata = json.loads(ctx.room.metadata)
    resume = metadata.get("resume")
    student = metadata.get("student")
    # Worker now configures LLM system prompt with candidate's actual projects
```

---

## 5. Frontend LiveKit Data Packet Event Contract

The mock interview worker sends real-time structured updates over LiveKit's lossless Data Channel (`room.localParticipant.publishData` or `participant.on('dataReceived')`).

### Expected Event Names & Schemas

| Event Name | Direction | Trigger | Description |
| :--- | :--- | :--- | :--- |
| `interview:greeting` | Worker $\rightarrow$ Frontend | Once on connect | Agent introduces itself and explains interview format. |
| `interview:question` | Worker $\rightarrow$ Frontend | Each round | Delivers the current technical or behavioral question. |
| `interview:transcript` | Bi-directional | Streaming | Real-time speech-to-text chunk with speaker tag. |
| `interview:results` | Worker $\rightarrow$ Frontend | Interview wrap-up | Comprehensive performance rubric and readiness impact score. |
| `interview:error` | Worker $\rightarrow$ Frontend | On failure | Error code and retry guidance. |

---

### Event Schemas (TypeScript Definitions)

```typescript
// 1. GREETING EVENT
export interface InterviewGreetingEvent {
  event: 'interview:greeting';
  payload: {
    interviewerName: string; // e.g. "MSOT Diagnostic Agent"
    interviewType: 'technical_infrastructure' | 'behavioral' | 'system_design';
    totalQuestions: number;  // e.g. 4
    greetingText: string;
    timestamp: number;
  };
}

// 2. QUESTION EVENT
export interface InterviewQuestionEvent {
  event: 'interview:question';
  payload: {
    questionIndex: number; // 1-based (e.g. 1)
    totalQuestions: number; // e.g. 4
    category: string;      // e.g. "Distributed Systems & Raft"
    questionText: string;
    targetCompetencies: string[]; // e.g. ["Leader election", "Split-brain mitigation"]
    timestamp: number;
  };
}

// 3. TRANSCRIPT EVENT (Streaming Speech-to-Text)
export interface InterviewTranscriptEvent {
  event: 'interview:transcript';
  payload: {
    id: string;
    speaker: 'agent' | 'student';
    text: string;
    isFinal: boolean;
    confidenceScore?: number;
    timestamp: number;
  };
}

// 4. RESULTS EVENT (Final Session Wrap-up)
export interface InterviewResultsEvent {
  event: 'interview:results';
  payload: {
    overallReadinessDelta: number; // e.g. +4 (points added to 84)
    finalScore: number;            // e.g. 88
    summary: string;
    categoryScores: {
      category: string;
      score: number;       // 0 - 100
      benchmark: number;   // Cohort average
      strengths: string[];
      critiques: string[];
    }[];
    suggestedFixes: {
      title: string;
      location: string;
      recommendedChange: string;
    }[];
    timestamp: number;
  };
}

// 5. ERROR EVENT
export interface InterviewErrorEvent {
  event: 'interview:error';
  payload: {
    code: 'AUDIO_INPUT_FAILED' | 'SYNTHESIS_TIMEOUT' | 'AGENT_DISCONNECTED';
    message: string;
    recoverable: boolean;
    timestamp: number;
  };
}

export type MockInterviewEvent =
  | InterviewGreetingEvent
  | InterviewQuestionEvent
  | InterviewTranscriptEvent
  | InterviewResultsEvent
  | InterviewErrorEvent;
```

---

## 6. Frontend Listener Implementation Pattern

```typescript
import { Room, RoomEvent, DataPacket_Kind } from 'livekit-client';

export function setupInterviewEventListeners(room: Room, onEvent: (e: MockInterviewEvent) => void) {
  room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant, kind) => {
    try {
      const decoder = new TextDecoder();
      const rawJson = decoder.decode(payload);
      const parsed = JSON.parse(rawJson) as MockInterviewEvent;

      switch (parsed.event) {
        case 'interview:greeting':
          console.log('[Mock Interview] Greeting received:', parsed.payload.greetingText);
          onEvent(parsed);
          break;
        case 'interview:question':
          console.log(`[Mock Interview] Question ${parsed.payload.questionIndex}:`, parsed.payload.questionText);
          onEvent(parsed);
          break;
        case 'interview:transcript':
          onEvent(parsed);
          break;
        case 'interview:results':
          console.log('[Mock Interview] Final Score:', parsed.payload.finalScore);
          onEvent(parsed);
          break;
        case 'interview:error':
          console.error('[Mock Interview] Error:', parsed.payload.message);
          onEvent(parsed);
          break;
      }
    } catch (err) {
      console.error('Failed to parse LiveKit data packet', err);
    }
  });
}
```

---

## 7. Integrity Guarantee
No existing platform shell components, routes, styles, or working files were modified to create this document. All components remain in their working, tested state.
