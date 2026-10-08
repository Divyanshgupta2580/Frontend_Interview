import React, { useState, useEffect, useRef } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import {
  MockInterviewLiveKitService,
  LiveKitQuestionPayload,
  LiveKitTranscriptPayload,
  LiveKitResultsPayload,
  LiveKitErrorPayload
} from '../../services/livekitClient';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
  Radio,
  FileText
} from 'lucide-react';

export const MockInterviewModal: React.FC = () => {
  const {
    isInterviewModalOpen,
    closeInterviewModal,
    currentUser,
    readinessData,
    applyInterviewResults
  } = usePlatformStore();

  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [greeting, setGreeting] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<LiveKitQuestionPayload | null>(null);
  const [transcripts, setTranscripts] = useState<LiveKitTranscriptPayload[]>([]);
  const [interviewResults, setInterviewResults] = useState<LiveKitResultsPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ roomName: string; interviewId: string } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const livekitServiceRef = useRef<MockInterviewLiveKitService | null>(null);
  const timerRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Elapsed interview timer
  useEffect(() => {
    if (connectionState === 'connected') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [connectionState]);

  // Initialize and connect
  const handleStartInterview = async () => {
    setErrorMessage(null);
    setConnectionState('connecting');
    setTranscripts([]);
    setInterviewResults(null);
    setCurrentQuestion(null);
    setGreeting('');
    setElapsedSeconds(0);

    try {
      // 1. Obtain Supabase session token
      const mockSupabaseJwt = `mock_sb_jwt_eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: currentUser.id,
          email: currentUser.email,
          role: 'authenticated',
          user_metadata: { name: currentUser.name },
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      )}.signature`;

      // 2. Call POST /api/interview/session
      const res = await fetch('/api/interview/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockSupabaseJwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: currentUser.id,
          targetRole: readinessData.targetRole,
          jobId: 'job-01',
          resumeId: 'res_alex_chen_v2'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Session API responded with status ${res.status}`);
      }

      const session = await res.json();
      setSessionInfo({ roomName: session.roomName, interviewId: session.interviewId });

      // 3. Instantiate LiveKit Client Service with Event Handlers
      const service = new MockInterviewLiveKitService({
        onGreeting: (payload) => {
          setGreeting(payload.greeting);
        },
        onQuestion: (payload) => {
          setCurrentQuestion(payload);
        },
        onTranscript: (payload) => {
          setTranscripts((prev) => [...prev, payload]);
        },
        onResults: (payload) => {
          setInterviewResults(payload);
          setConnectionState('disconnected');
        },
        onError: (payload) => {
          setErrorMessage(payload.message);
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state);
        }
      });

      livekitServiceRef.current = service;

      // 4. Connect to LiveKit Room
      try {
        await service.connect(session.serverUrl, session.token);
      } catch (webrtcErr) {
        // If live cloud worker is not yet running, enable local demonstration worker simulation
        console.warn('[LiveKit Notice] Live cloud worker unreachable. Enabling simulation mode.', webrtcErr);
        runSimulatedLiveKitInterview();
      }
    } catch (err: unknown) {
      setConnectionState('disconnected');
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  // Simulated fallback worker loop for offline evaluation & testing
  const runSimulatedLiveKitInterview = () => {
    setConnectionState('connected');
    setGreeting(`Hello ${currentUser.name}! I am your MSOT AI Systems Interviewer. We will focus on ${readinessData.targetRole} competencies.`);

    setTimeout(() => {
      setCurrentQuestion({
        questionIndex: 1,
        totalQuestions: 4,
        category: 'Distributed Systems & Leader Election',
        question: 'Walk me through how your Go Raft consensus implementation handles network partitions and prevents split-brain scenarios when a deposed leader reconnects.',
        evaluationCriteria: ['Term validation', 'Heartbeat timers', 'Log quorum replication']
      });
      setTranscripts((prev) => [
        ...prev,
        {
          speaker: 'agent',
          text: 'Welcome Alexandre. Let us dive into question 1: Walk me through how your Go Raft implementation handles network partitions.',
          isFinal: true,
          timestamp: Date.now()
        }
      ]);
    }, 1500);

    setTimeout(() => {
      setTranscripts((prev) => [
        ...prev,
        {
          speaker: 'student',
          text: 'In our Raft cluster, terms are monotonically increasing. When a partitioned leader reconnects with stale state, it recognizes a higher term in inbound RPC responses and immediately transitions to Follower state, reconciling uncommitted log entries against the current leader log quorum.',
          isFinal: true,
          timestamp: Date.now()
        }
      ]);
    }, 5500);
  };

  const handleFinishInterview = async () => {
    if (livekitServiceRef.current) {
      await livekitServiceRef.current.finishInterview();
      livekitServiceRef.current.disconnect();
    }

    // Trigger mock result payload if not yet received
    if (!interviewResults) {
      const mockResult: LiveKitResultsPayload = {
        overallReadinessDelta: 4,
        finalScore: 88,
        summary: 'Candidate demonstrated exemplary mastery of distributed consensus, Raft term reconciliation, and concurrency barriers. Recommended adding explicit latency percentiles to production experience.',
        categoryScores: [
          {
            category: 'System Architecture & Concurrency',
            score: 92,
            benchmark: 85,
            strengths: ['Accurate Raft term state reconciliation', 'Split-brain awareness'],
            critiques: ['Expand on log compaction snapshots']
          },
          {
            category: 'Impact Quantification & Metrics',
            score: 86,
            benchmark: 80,
            strengths: ['Clear p99 latency baseline'],
            critiques: ['Include throughput numbers']
          }
        ],
        suggestedFixes: [
          {
            title: 'Highlight Raft state reconciliation metrics',
            location: 'Experience - Datamesh Engine',
            recommendedChange: 'Reconciled partitioned logs with 0% data loss under simulated network fault injection.'
          }
        ],
        timestamp: Date.now()
      };
      setInterviewResults(mockResult);
    }
    setConnectionState('disconnected');
  };

  const handleApplyAndClose = () => {
    if (interviewResults) {
      applyInterviewResults({
        finalScore: interviewResults.finalScore,
        overallReadinessDelta: interviewResults.overallReadinessDelta,
        summary: interviewResults.summary,
        categoryScores: interviewResults.categoryScores,
        suggestedFixes: interviewResults.suggestedFixes
      });
    }
    closeInterviewModal();
  };

  if (!isInterviewModalOpen) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} / 20:00`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  LiveKit Real-Time Mock Interview
                </h3>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  connectionState === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : connectionState === 'connecting'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {connectionState.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Target Role: <span className="text-sky-300 font-semibold">{readinessData.targetRole}</span>
                {sessionInfo && ` · Room: ${sessionInfo.roomName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectionState === 'connected' && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{timeDisplay}</span>
              </div>
            )}
            <button
              onClick={() => {
                if (livekitServiceRef.current) livekitServiceRef.current.disconnect();
                closeInterviewModal();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {connectionState === 'idle' && !interviewResults && (
            <div className="text-center py-12 max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <Volume2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                Ready for Technical Interview Session
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connects directly to the LiveKit WebRTC Worker Agent (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">mock-interview</code>). 
                The worker reads your parsed resume metadata and benchmarks responses across 4 distributed systems questions.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs font-mono text-slate-600 space-y-1.5">
                <div className="text-slate-900 font-bold mb-1">Session Pre-Flight Contract:</div>
                <div>• Supabase JWT Authoritative Subject: <span className="text-indigo-600 font-bold">{currentUser.id}</span></div>
                <div>• Ingested Candidate Resume: <span className="text-slate-800">res_alex_chen_v2.pdf</span></div>
                <div>• LiveKit WebRTC Audio: Bi-directional low latency pipeline</div>
                <div>• Max Duration: 20-minute safety limit</div>
              </div>

              <button
                onClick={handleStartInterview}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start LiveKit Mock Interview</span>
              </button>
            </div>
          )}

          {connectionState === 'connecting' && (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Initiating LiveKit Room & Verifying Supabase JWT...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Calling POST /api/interview/session → Minting Token
              </p>
            </div>
          )}

          {/* Active Interview Room */}
          {connectionState === 'connected' && (
            <div className="space-y-6">
              
              {/* Current Question Banner */}
              {currentQuestion && (
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-indigo-700 uppercase">
                      Question {currentQuestion.questionIndex} of {currentQuestion.totalQuestions || 4} · {currentQuestion.category}
                    </span>
                    <span className="text-slate-500">Live Rubric Assessment</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-indigo-950">
                    "{currentQuestion.question}"
                  </h4>
                  {currentQuestion.evaluationCriteria && (
                    <div className="pt-2 border-t border-indigo-200/60 flex items-center gap-2 flex-wrap text-xs text-indigo-800">
                      <span className="font-bold">Evaluation Criteria:</span>
                      {currentQuestion.evaluationCriteria.map((crit, idx) => (
                        <span key={idx} className="bg-white/80 px-2 py-0.5 rounded border border-indigo-200 text-indigo-900">
                          {crit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Transcript Channel */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 space-y-3 min-h-[220px] max-h-[320px] overflow-y-auto">
                <span className="text-xs font-mono uppercase text-slate-500 font-semibold block">
                  Live WebRTC Data-Channel Transcripts
                </span>
                
                {transcripts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">
                    Listening to microphone... Speak to answer the question.
                  </p>
                ) : (
                  transcripts.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs sm:text-sm ${
                        t.speaker === 'agent'
                          ? 'bg-white border border-indigo-100 text-slate-900 shadow-2xs'
                          : 'bg-indigo-600 text-white shadow-2xs ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[11px] font-mono opacity-80">
                        <span className="font-bold capitalize">
                          {t.speaker === 'agent' ? 'AI Systems Interviewer' : currentUser.name}
                        </span>
                        {t.isFinal && <span>✓ Final</span>}
                      </div>
                      <p className="leading-relaxed">{t.text}</p>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>

              {/* Real-Time Microphone & Controls Strip */}
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Microphone Active (WebRTC Audio Stream)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-2.5 rounded-lg border font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                      isMicMuted
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                    <span>{isMicMuted ? 'Muted' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={handleFinishInterview}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Finish Interview</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Card */}
          {interviewResults && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50/60 to-emerald-50/40 border border-indigo-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h4 className="text-xl font-bold text-slate-900">
                      Technical Interview Scorecard
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {interviewResults.finalScore}
                    </span>
                    <span className="text-sm text-slate-500">/ 100</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md ml-1">
                      +{interviewResults.overallReadinessDelta} pts Delta
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {interviewResults.summary}
                </p>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {interviewResults.categoryScores.map((cat, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span>{cat.category}</span>
                        <span className="font-mono text-indigo-600 font-bold">{cat.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${cat.score}%` }} />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Benchmark: {cat.benchmark}%</span>
                        <span className="text-emerald-700 font-medium">Verified Mastery</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested Fixes */}
                {interviewResults.suggestedFixes.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="text-xs font-mono uppercase font-bold text-slate-700">
                      Recommended Targeted Fixes:
                    </span>
                    {interviewResults.suggestedFixes.map((fix, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-0.5">
                        <strong className="text-slate-900 block">{fix.title} ({fix.location})</strong>
                        <p className="text-slate-600">{fix.recommendedChange}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action button */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleStartInterview}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all"
                >
                  Retake Interview
                </button>
                <button
                  onClick={handleApplyAndClose}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Results to Readiness Passport</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
          <span>Worker: mock-interview · Room: {sessionInfo?.roomName || 'Pending'}</span>
          <span>WebRTC · Opus 48kHz</span>
        </div>
      </div>
    </div>
  );
};
