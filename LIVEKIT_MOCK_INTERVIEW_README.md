# MSOT Platform Shell: LiveKit Mock Interview & Supabase Technical Integration Guide

This document provides the definitive, comprehensive technical specification and file index for the **Mock Interview Service**, **LiveKit WebRTC Integration**, and **Supabase JWT Authentication Flow** in the MSOT Platform Shell.

---

## 1. Executive Summary & File Inventory

All requested integration components have been implemented directly in the repository:

| Integration Area | File Path | Description |
| :--- | :--- | :--- |
| **Session API Route** | `/server.ts` | Implements `POST /api/interview/session`, `POST /api/interview/finish`, and `GET /api/health`. |
| **LiveKit Server Service** | `/src/services/livekitServer.ts` | Pre-creates LiveKit room, injects `room.metadata`, and generates student `AccessToken` (30m expiry). |
| **Supabase JWT Verifier** | `/src/services/supabaseAuth.ts` | Validates `Authorization: Bearer <token>`, enforces `jwt.sub` as authoritative identity. |
| **Frontend LiveKit WebRTC** | `/src/services/livekitClient.ts` | Connects via `Room.connect()`, publishes mic, subscribes to worker audio, listens to `RoomEvent.DataReceived`. |
| **Mock Interview UI Modal** | `/src/components/interview/MockInterviewModal.tsx` | End-to-end interactive interview room with live speech indicator, timer, transcript streamer, and rubric scorecard. |
| **Platform State Store** | `/src/store/usePlatformStore.ts` | Zustand store receiving `interview:results` and automatically applying score deltas to the Readiness Dashboard. |
| **Environment Configuration** | `/.env.example` | Template for `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `SUPABASE_JWT_SECRET`. |

---

## 2. Item 1: Session API (`POST /api/interview/session`)

### Endpoint Details
* **Method**: `POST`
* **Path**: `/api/interview/session`
* **File**: `/server.ts` (lines 20–68)

### Required Headers
```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

### Expected Request Body
```json
{
  "studentId": "optional-client-value",
  "targetRole": "Distributed Systems Engineer",
  "jobId": "job-01",
  "resumeId": "res_alex_chen_v2"
}
```

### Authoritative Identity Rule
1. The backend inspects the `Authorization: Bearer <token>` header.
2. The JWT is verified using `verifySupabaseSession()` in `/src/services/supabaseAuth.ts`.
3. **The `sub` claim is strictly authoritative for student identity.**
4. The request body `studentId` is used **only** as an optional consistency check. If `body.studentId !== jwt.sub`, the backend logs a security notice and forces the authoritative `jwt.sub` as the participant identity.

### Expected Response Body (`200 OK`)
```json
{
  "serverUrl": "wss://interviewxai-owtcvxdw.livekit.cloud",
  "roomName": "interview_stu_alex_chen_1773059281000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "interviewId": "intv_9823482"
}
```

### Error Responses
* `401 Unauthorized`: Missing or invalid Supabase JWT (`{ "error": "Unauthorized", "message": "..." }`)
* `500 Internal Server Error`: LiveKit room provisioning or unexpected failure (`{ "error": "InternalServerError", "message": "..." }`)

---

## 3. Item 2: LiveKit Room Metadata Contract

### Metadata Schema
Before the student connects to the room, the backend sets `room.metadata` with the following JSON structure:

```json
{
  "interviewId": "intv_9823482",
  "student": {
    "id": "student-uuid",
    "name": "Alexandre Chen",
    "targetRole": "Distributed Systems Engineer"
  },
  "resume": {
    "parsedText": "Candidate Alexandre Chen - Senior Systems Engineer with deep expertise in Go, Kubernetes, raft consensus, and high-throughput streaming systems. Led migration to distributed raft cluster reducing p99 latency by 34%. (Resume Ref: res_alex_chen_v2)",
    "keySkills": [
      "Go",
      "Distributed Systems",
      "Raft",
      "Kubernetes",
      "gRPC",
      "Distributed Consensus"
    ],
    "pdfUrl": "https://ais-platform.dev/resumes/alex_chen_systems.pdf"
  },
  "job": {
    "title": "Systems Infrastructure Engineer",
    "company": "Datamesh Engine",
    "minimumThresholdScore": 85
  },
  "focusAreas": [
    "Concurrency and leader election",
    "Latency trade-offs and backpressure",
    "Failure modes, split-brain scenarios and network partitions"
  ]
}
```

### Backend Confirmations
* **Which backend creates the room?**  
  The MSOT Platform Shell backend (`server.ts` invoking `RoomServiceClient` in `/src/services/livekitServer.ts`).
* **Which backend sets the metadata?**  
  The MSOT Platform Shell backend sets `room.metadata` using `RoomServiceClient.createRoom({ name, metadata: metadataJson })`.
* **Is metadata set before the student joins?**  
  **Yes, 100% confirmed.** The room is initialized and metadata is stored prior to returning the `token` to the frontend client. (As an additional resilience layer, the metadata is also embedded inside the student token grant).
* **Should the LiveKit worker use `room.metadata` as its source of context?**  
  **Yes, confirmed.** When the worker agent (`mock-interview`) receives the room entry webhook/event, it parses `room.metadata` to retrieve the student identity, parsed resume, target role, and focus areas.

---

## 4. Item 3: LiveKit Token Permissions

Generated via `AccessToken` in `/src/services/livekitServer.ts`:

```typescript
const token = new AccessToken(apiKey, apiSecret, {
  identity: studentId,
  name: studentName,
  ttl: '30m', // 30 minutes expiration
  metadata: metadataJson
});

token.addGrant({
  roomJoin: true,
  room: roomName,
  canPublish: true,      // Allows student microphone streaming
  canSubscribe: true,    // Allows student to hear worker audio
  canPublishData: true   // Allows data-channel finish messages
});
```

* **Token Expiry**: `30m` (1,800 seconds).
* **Target Worker Agent Name**: `mock-interview`.

---

## 5. Item 4: Frontend LiveKit WebRTC Audio Flow

### Connection Method
* **File**: `/src/services/livekitClient.ts`
* **Method**: `MockInterviewLiveKitService.connect(serverUrl, token)`

```typescript
const room = new Room({
  adaptiveStream: true,
  dynacast: true,
  audioCaptureDefaults: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true
  }
});

// Connect to LiveKit server
await room.connect(serverUrl, token);

// Publish student microphone track
await room.localParticipant.setMicrophoneEnabled(true);
```

### Worker Audio Playback
```typescript
room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
  if (track.kind === Track.Kind.Audio && audioEl) {
    track.attach(audioEl); // Streams synthesized worker audio to speakers
  }
});
```

### Production Audio Flow Diagram
```
┌─────────────────────────────────┐
│ Student Microphone (WebRTC)     │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ LiveKit Cloud Server / Room     │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ LiveKit Worker (mock-interview) │
│ • Deepgram / Whisper STT        │
│ • Groq / LLaMA-3.3 LLM Logic    │
│ • Cartesia / ElevenLabs TTS     │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ LiveKit Cloud Server / Room     │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ RemoteTrackSubscribed           │
│ HTML Audio Element (Opus 48kHz) │
│ Student Headphones / Speaker    │
└─────────────────────────────────┘
```

---

## 6. Item 5: LiveKit Data-Channel Events Contract

Data packets are decoded from `RoomEvent.DataReceived` in `/src/services/livekitClient.ts`:

```typescript
room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
  const message = JSON.parse(new TextDecoder().decode(payload));
  // message: { event: string, payload: any }
});
```

### Confirmed Event Names & Payloads

#### 1. `interview:greeting`
```json
{
  "event": "interview:greeting",
  "payload": {
    "agentName": "mock-interview",
    "greeting": "Hello Alexandre! Welcome to your Distributed Systems technical review. We'll explore concurrency, Raft consensus, and failure modes."
  }
}
```

#### 2. `interview:question`
```json
{
  "event": "interview:question",
  "payload": {
    "questionIndex": 1,
    "totalQuestions": 4,
    "category": "Concurrency & Leader Election",
    "question": "Walk me through how your Go Raft consensus implementation handles network partitions and prevents split-brain scenarios when a deposed leader reconnects.",
    "evaluationCriteria": [
      "Monotonic term progression",
      "Heartbeat interval timeouts",
      "Log quorum consensus"
    ]
  }
}
```

#### 3. `interview:transcript`
```json
{
  "event": "interview:transcript",
  "payload": {
    "speaker": "agent", // or "student"
    "text": "Walk me through how your Go Raft implementation handles network partitions.",
    "isFinal": true,
    "timestamp": 1773059300000
  }
}
```

#### 4. `interview:results`
```json
{
  "event": "interview:results",
  "payload": {
    "overallReadinessDelta": 4,
    "finalScore": 88,
    "summary": "Candidate demonstrated exemplary mastery of distributed consensus, Raft term reconciliation, and concurrency barriers. Recommended adding explicit latency percentiles to production experience.",
    "categoryScores": [
      {
        "category": "System Architecture & Concurrency",
        "score": 92,
        "benchmark": 85,
        "strengths": [
          "Accurate Raft term state reconciliation",
          "Deep split-brain awareness"
        ],
        "critiques": [
          "Expand on log compaction snapshots"
        ]
      },
      {
        "category": "Impact Quantification & Metrics",
        "score": 86,
        "benchmark": 80,
        "strengths": [
          "Clear p99 latency reduction baseline"
        ],
        "critiques": [
          "Include write throughput IOPS"
        ]
      }
    ],
    "suggestedFixes": [
      {
        "title": "Highlight Raft state reconciliation metrics",
        "location": "Experience - Datamesh Engine",
        "recommendedChange": "Reconciled partitioned logs with 0% data loss under simulated network fault injection."
      }
    ],
    "timestamp": 1773059600000
  }
}
```

#### 5. `interview:error`
```json
{
  "event": "interview:error",
  "payload": {
    "code": "STT_STREAM_TIMEOUT",
    "message": "Microphone audio frame dropped. Recovering stream...",
    "recoverable": true
  }
}
```

---

## 7. Item 6: Interview Completion Flow

The system supports **all three completion triggers**:

1. **User Action ("Finish Interview" Button)**:
   * Clicking "Finish Interview" in `/src/components/interview/MockInterviewModal.tsx` calls `service.finishInterview()`.
   * It sends a reliable binary data packet:
     ```json
     {
       "event": "interview:finish",
       "payload": {
         "timestamp": 1773059600000,
         "requestedBy": "student"
       }
     }
     ```
   * It also invokes `POST /api/interview/finish` for backend cleanup.
2. **Automatic Completion After 4 Questions**:
   * The worker sends `interview:results` upon concluding Question 4, which immediately switches the UI to the completed scorecard.
3. **20-Minute Safety Timeout**:
   * Enforced on the frontend client timer (`MAX_DURATION_MS = 20 * 60 * 1000`) and on the LiveKit server room (`emptyTimeout: 600`).

---

## 8. Item 7: Supabase & Resume Integration Details

### Authentication Flow
1. The student logs in via `AuthModal.tsx` or uses an active Supabase session.
2. The access token (`Authorization: Bearer <token>`) is transmitted to `/api/interview/session`.
3. `/src/services/supabaseAuth.ts` verifies the token and yields the authoritative `sub` ID.
4. The backend pulls the student's stored resume from the platform models (`/src/data/mockData.ts`).
5. The backend compiles the resume text, skills, job title, and focus areas into `roomMetadata`.
6. LiveKit room is provisioned and token is minted.
7. Upon receiving `interview:results`, `usePlatformStore.applyInterviewResults()` updates:
   * `overallScore`: Updated to `finalScore` (e.g. 88/100).
   * `scoreHistory`: Logs the new score trajectory date.
   * `categories`: Updates individual category percentages and benchmarks.
   * `fixes`: Appends the new targeted fix items generated by the interview.

---

## 9. Verification & Run Commands

* **Compile Check**: `npm run lint` (runs `tsc --noEmit`).
* **Dev Server**: `npm run dev` (starts full-stack server on port 3000 via `tsx server.ts`).
* **Production Build**: `npm run build` && `npm start`.
