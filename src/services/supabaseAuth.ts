import { jwtVerify, decodeJwt } from 'jose';

export interface VerifiedStudentSession {
  isValid: boolean;
  studentId: string;
  email?: string;
  role?: string;
  claims?: Record<string, unknown>;
  error?: string;
}

/**
 * Extracts and verifies the Supabase access token from Authorization header.
 * The `sub` claim is strictly authoritative for student identity.
 */
export async function verifySupabaseSession(
  authHeader: string | undefined,
  bodyStudentId?: string
): Promise<VerifiedStudentSession> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      studentId: '',
      error: 'Missing or malformed Authorization header. Expected Bearer <supabase-access-token>'
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return {
      isValid: false,
      studentId: '',
      error: 'Empty bearer token supplied.'
    };
  }

  const jwtSecret = process.env.SUPABASE_JWT_SECRET;

  try {
    let payload: Record<string, unknown>;

    if (jwtSecret) {
      const secretBytes = new TextEncoder().encode(jwtSecret);
      const verified = await jwtVerify(token, secretBytes);
      payload = verified.payload as Record<string, unknown>;
    } else {
      // In development environments without configured SUPABASE_JWT_SECRET,
      // decode token and enforce claim structure
      payload = decodeJwt(token) as Record<string, unknown>;
    }

    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) {
      return {
        isValid: false,
        studentId: '',
        error: 'Invalid JWT: Missing authoritative sub claim.'
      };
    }

    // Optional consistency check against body.studentId if provided by caller
    if (bodyStudentId && bodyStudentId !== sub) {
      console.warn(
        `[Auth Warning] body.studentId (${bodyStudentId}) does not match authoritative JWT sub (${sub}). JWT sub takes precedence.`
      );
    }

    return {
      isValid: true,
      studentId: sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : 'authenticated',
      claims: payload
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      studentId: '',
      error: `Supabase JWT verification failed: ${errorMsg}`
    };
  }
}
