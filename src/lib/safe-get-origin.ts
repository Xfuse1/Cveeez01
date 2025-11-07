export function getAppOrigin(): string {
  // Client-side origin if available
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Use explicit public URL set in environment (recommended)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // On Vercel, VERCEL_URL is provided without protocol
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost dev server
  return 'http://localhost:9004';
}
