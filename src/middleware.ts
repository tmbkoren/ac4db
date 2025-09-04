import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback
     * - /confirm-email
     * - /complete-profile
     * - /login
     * - /signup
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|confirm-email|complete-profile|login|signup|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
