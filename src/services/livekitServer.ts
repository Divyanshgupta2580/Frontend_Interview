import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface LiveKitRoomMetadata {
  interviewId: string;
  student: {
    id: string;
    name: string;
    targetRole: string;
  };
  resume: {
    parsedText: string;
    keySkills: string[];
    pdfUrl: string;
  };
  job: {
    title: string;
    company: string;
    minimumThresholdScore: number;
  };
  focusAreas: string[];
}

export interface SessionResponsePayload {
  serverUrl: string;
  roomName: string;
  token: string;
  interviewId: string;
}

/**
 * Creates LiveKit Room, sets room metadata, and generates student access token.
 */
export async function createMockInterviewSession(params: {
  studentId: string;
  studentName?: string;
  targetRole: string;
  jobId?: string;
  resumeId?: string;
}): Promise<SessionResponsePayload> {
  const { studentId, studentName = 'Alexandre Chen', targetRole, jobId, resumeId } = params;

  const serverUrl = process.env.LIVEKIT_URL || 'wss://interviewxai-owtcvxdw.livekit.cloud';
  const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret_mock_interview_token_key_12345';

  const timestamp = Date.now();
  const interviewId = `intv_${Math.floor(Math.random() * 9000000 + 1000000)}`;
  const roomName = `interview_${studentId}_${timestamp}`;

  // 1. Build authoritative room metadata matching worker contract
  const roomMetadata: LiveKitRoomMetadata = {
    interviewId,
    student: {
      id: studentId,
      name: studentName,
      targetRole: targetRole || 'Distributed Systems Engineer'
    },
    resume: {
      parsedText: `Candidate ${studentName} - Senior Systems Engineer with deep expertise in Go, Kubernetes, raft consensus, and high-throughput streaming systems. Led migration to distributed raft cluster reducing p99 latency by 34%. (Resume Ref: ${resumeId || 'res_alex_chen_v2'})`,
      keySkills: ['Go', 'Distributed Systems', 'Raft', 'Kubernetes', 'gRPC', 'Distributed Consensus'],
      pdfUrl: 'https://ais-platform.dev/resumes/alex_chen_systems.pdf'
    },
    job: {
      title: targetRole.includes('Systems') ? 'Systems Infrastructure Engineer' : 'Senior Backend Engineer',
      company: 'Datamesh Engine',
      minimumThresholdScore: 85
    },
    focusAreas: [
      'Concurrency and leader election',
      'Latency trade-offs and backpressure',
      'Failure modes, split-brain scenarios and network partitions'
    ]
  };

  const metadataJson = JSON.stringify(roomMetadata);

  // 2. Pre-create LiveKit room and set room.metadata before student connects
  // Convert wss:// to https:// for REST RoomServiceClient
  const httpUrl = serverUrl.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://');

  try {
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes empty timeout
      maxParticipants: 4,
      metadata: metadataJson
    });
    console.log(`[LiveKit Server] Successfully created room ${roomName} and set metadata`);
  } catch (err: unknown) {
    // In local sandbox environments without live cloud credentials, log and proceed with token creation
    console.warn(`[LiveKit Server] RoomServiceClient notice: ${err instanceof Error ? err.message : String(err)}. Token will carry room context.`);
  }

  // 3. Generate student LiveKit access token with exact permissions
  // Permissions:
  // - roomJoin: true
  // - canPublish: true
  // - canSubscribe: true
  // - canPublishData: true
  // Expiration: 30 minutes (1800 seconds)
  const token = new AccessToken(apiKey, apiSecret, {
    identity: studentId,
    name: studentName,
    ttl: '30m', // 30 minutes expiry
    metadata: metadataJson
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  });

  const jwtToken = await token.toJwt();

  return {
    serverUrl,
    roomName,
    token: jwtToken,
    interviewId
  };
}
