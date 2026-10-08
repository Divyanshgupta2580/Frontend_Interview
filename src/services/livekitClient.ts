import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Track,
  DataPacket_Kind
} from 'livekit-client';

export interface LiveKitQuestionPayload {
  questionIndex: number;
  totalQuestions?: number;
  category: string;
  question: string;
  evaluationCriteria?: string[];
}

export interface LiveKitTranscriptPayload {
  speaker: 'agent' | 'student';
  text: string;
  isFinal: boolean;
  timestamp?: number;
}

export interface LiveKitResultsPayload {
  overallReadinessDelta: number;
  finalScore: number;
  summary: string;
  categoryScores: {
    category: string;
    score: number;
    benchmark: number;
    strengths: string[];
    critiques: string[];
  }[];
  suggestedFixes: {
    title: string;
    location: string;
    recommendedChange: string;
  }[];
  timestamp: number;
}

export interface LiveKitErrorPayload {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface LiveKitEventHandlers {
  onGreeting?: (payload: { agentName: string; greeting: string }) => void;
  onQuestion?: (payload: LiveKitQuestionPayload) => void;
  onTranscript?: (payload: LiveKitTranscriptPayload) => void;
  onResults?: (payload: LiveKitResultsPayload) => void;
  onError?: (payload: LiveKitErrorPayload) => void;
  onConnectionStateChange?: (state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
}

export class MockInterviewLiveKitService {
  private room: Room | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private handlers: LiveKitEventHandlers = {};
  private timerId: number | null = null;
  private readonly MAX_DURATION_MS = 20 * 60 * 1000; // 20-minute timeout

  constructor(handlers: LiveKitEventHandlers = {}) {
    this.handlers = handlers;
    if (typeof window !== 'undefined') {
      this.audioEl = document.createElement('audio');
      this.audioEl.autoplay = true;
    }
  }

  /**
   * Connects to LiveKit Room, publishes microphone, attaches worker audio, and hooks data channel.
   */
  public async connect(serverUrl: string, token: string): Promise<Room> {
    this.handlers.onConnectionStateChange?.('connecting');

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    this.room = room;

    // 1. Data-channel event listeners
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      this.handleDataReceived(payload, participant);
    });

    // 2. Worker audio track subscription
    room.on(RoomEvent.TrackSubscribed, (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Audio && this.audioEl) {
        track.attach(this.audioEl);
        console.log(`[LiveKit WebRTC] Attached remote audio track from ${participant.identity}`);
      }
    });

    // 3. Connection state handling
    room.on(RoomEvent.Connected, () => {
      this.handlers.onConnectionStateChange?.('connected');
      console.log(`[LiveKit WebRTC] Connected to room: ${room.name}`);
      this.startSafetyTimeout();
    });

    room.on(RoomEvent.Disconnected, () => {
      this.handlers.onConnectionStateChange?.('disconnected');
      this.clearSafetyTimeout();
      console.log('[LiveKit WebRTC] Room disconnected');
    });

    room.on(RoomEvent.Reconnecting, () => {
      this.handlers.onConnectionStateChange?.('reconnecting');
    });

    room.on(RoomEvent.Reconnected, () => {
      this.handlers.onConnectionStateChange?.('connected');
    });

    try {
      // Connect to LiveKit Room
      await room.connect(serverUrl, token);

      // Publish Student Microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log('[LiveKit WebRTC] Local microphone track published');

      return room;
    } catch (err: unknown) {
      this.handlers.onConnectionStateChange?.('disconnected');
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.handlers.onError?.({
        code: 'CONNECTION_FAILED',
        message: `Failed to connect to LiveKit server: ${errorMsg}`,
        recoverable: true
      });
      throw err;
    }
  }

  /**
   * Decodes incoming data-channel JSON and routes to specific event handlers
   */
  private handleDataReceived(payload: Uint8Array, participant?: RemoteParticipant) {
    try {
      const decoder = new TextDecoder();
      const str = decoder.decode(payload);
      const data = JSON.parse(str);

      console.log(`[LiveKit Data Event] Received '${data.event}' from ${participant?.identity || 'worker'}:`, data);

      switch (data.event) {
        case 'interview:greeting':
          this.handlers.onGreeting?.(data.payload);
          break;
        case 'interview:question':
          this.handlers.onQuestion?.(data.payload);
          break;
        case 'interview:transcript':
          this.handlers.onTranscript?.(data.payload);
          break;
        case 'interview:results':
          this.handlers.onResults?.(data.payload);
          break;
        case 'interview:error':
          this.handlers.onError?.(data.payload);
          break;
        default:
          console.warn('[LiveKit Data Event] Unhandled event name:', data.event);
      }
    } catch (err) {
      console.error('[LiveKit Data Event] Error parsing data payload:', err);
    }
  }

  /**
   * Sends Finish Interview signal to the worker via LiveKit Data Channel
   */
  public async finishInterview(): Promise<void> {
    if (!this.room) return;

    try {
      const message = JSON.stringify({
        event: 'interview:finish',
        payload: {
          timestamp: Date.now(),
          requestedBy: 'student'
        }
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      await this.room.localParticipant.publishData(data, {
        reliable: true
      });
      console.log('[LiveKit Data Event] Published interview:finish to worker');
    } catch (err) {
      console.error('[LiveKit WebRTC] Error sending finish signal:', err);
    }
  }

  /**
   * Disconnects and cleans up tracks and elements
   */
  public disconnect(): void {
    this.clearSafetyTimeout();
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.audioEl) {
      this.audioEl.srcObject = null;
    }
  }

  private startSafetyTimeout(): void {
    this.clearSafetyTimeout();
    this.timerId = window.setTimeout(() => {
      console.warn('[LiveKit Safety Timer] 20-minute maximum interview timeout reached');
      this.finishInterview();
    }, this.MAX_DURATION_MS);
  }

  private clearSafetyTimeout(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
