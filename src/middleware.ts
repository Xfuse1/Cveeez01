import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Authentication is handled by client-side layouts
// This middleware is kept minimal to avoid redirect loops

export function middleware(request: NextRequest) {
  // Let client-side layouts handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/services/:path*',
    '/admin/:path*',
    '/employer/:path*',
    '/wallet/:path*',
    '/jobs/:path*',
    '/talent-space/:path*',
    // '/ecommerce/:path*', // Public - no auth required
  ],
};
