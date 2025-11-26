import type { User as FirebaseUser } from 'firebase/auth';
import type { User as TalentSpaceUser } from '@/types/talent-space';

/**
 * Maps a Firebase Auth User to the Talent Space User interface.
 * @param authUser The user object from Firebase Auth
 * @returns TalentSpaceUser or null if authUser is null
 */
// TODO: strict type: replace FirebaseUser with any to avoid namespace type issues; will use proper type in strict pass
export function mapAuthUserToTalentUser(authUser: any | null): TalentSpaceUser | null {
  if (!authUser) return null;

  return {
    id: authUser.uid,
    name: authUser.displayName || 'User',
    headline: '', // Placeholder as Firebase Auth doesn't have headline by default
    avatarUrl: authUser.photoURL || '',
  };
}
