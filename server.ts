import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifySupabaseSession } from './src/services/supabaseAuth.js';
import { createMockInterviewSession } from './src/services/livekitServer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// API: POST /api/interview/session
// Initiates mock interview session, verifies Supabase JWT, creates room & token
// -----------------------------------------------------------------------------
app.post('/api/interview/session', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const { studentId: bodyStudentId, targetRole, jobId, resumeId } = req.body || {};

    // 1. Verify Supabase JWT & authenticate student identity
    const session = await verifySupabaseSession(authHeader, bodyStudentId);

    if (!session.isValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: session.error || 'Invalid Supabase access token'
      });
      return;
    }

    // 2. Authoritative student ID comes strictly from JWT sub claim
    const authoritativeStudentId = session.studentId;

    // Optional consistency check log
    if (bodyStudentId && bodyStudentId !== authoritativeStudentId) {
      console.warn(
        `[Session API] Discrepancy detected: Body studentId='${bodyStudentId}', Authoritative JWT sub='${authoritativeStudentId}'. Utilizing authoritative sub.`
      );
    }

    // 3. Create LiveKit room, set metadata, and generate token
    const studentName = (session.claims?.user_metadata as Record<string, unknown>)?.name as string || 'Alexandre Chen';

    const sessionData = await createMockInterviewSession({
      studentId: authoritativeStudentId,
      studentName,
      targetRole: targetRole || 'Distributed Systems Engineer',
      jobId: jobId || 'job-01',
      resumeId: resumeId || 'res_alex_chen_v2'
    });

    res.status(200).json(sessionData);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Session API Error]', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: errorMessage
    });
  }
});

// -----------------------------------------------------------------------------
// API: POST /api/interview/finish
// Finish signal endpoint for room cleanup or fallback trigger
// -----------------------------------------------------------------------------
app.post('/api/interview/finish', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomName, interviewId, reason = 'user_finished' } = req.body || {};
    console.log(`[Interview Finished] Room: ${roomName}, Interview: ${interviewId}, Reason: ${reason}`);

    res.status(200).json({
      success: true,
      interviewId,
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    res.status(500).json({ error: 'Failed to finish interview' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'msot-interview-platform-shell'
  });
});

// -----------------------------------------------------------------------------
// Dev vs Production Vite Setup
// -----------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] MSOT Platform Shell running on port ${PORT}`);
  });
}

startServer();
