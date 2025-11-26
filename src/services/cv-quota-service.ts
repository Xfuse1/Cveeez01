import { db } from '@/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';

export type CVPlan = 'monthly' | 'one-time' | 'unlimited';

export interface CVQuotaDoc {
  userId: string;
  allowed: number; // total allowed in the window
  used: number; // used so far
  plan: CVPlan;
  // TODO: strict type: replace `any` with `Timestamp` when Firebase namespace types are resolved
  expiresAt?: any | null; // when quota resets or expires
  updatedAt?: any;
}

const quotasCollection = 'cvQuotas';

export class CVQuotaService {
  static getDocRef(userId: string) {
    return doc(db, quotasCollection, userId);
  }

  /**
   * Read quota document for user. Returns null if not found.
   */
  static async getQuota(userId: string): Promise<CVQuotaDoc | null> {
    const ref = this.getDocRef(userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return {
      userId,
      allowed: data.allowed || 0,
      used: data.used || 0,
      plan: data.plan || 'one-time',
      expiresAt: data.expiresAt || null,
      updatedAt: data.updatedAt || null,
    };
  }

  /**
   * Create or replace quota doc for a user.
   * Use this when user purchases a plan.
   */
  static async setQuota(userId: string, allowed: number, plan: CVPlan, expiresAt?: Date | null) {
    const ref = this.getDocRef(userId);
    const payload: any = {
      userId,
      allowed,
      used: 0,
      plan,
      updatedAt: serverTimestamp(),
    };
    if (expiresAt) payload.expiresAt = Timestamp.fromDate(expiresAt);
    await setDoc(ref, payload, { merge: true });
  }

  /**
   * Atomically consume one quota unit for a user when creating a CV.
   * Returns true if quota was consumed, false if quota exhausted or missing.
   */
  static async consumeQuota(userId: string): Promise<boolean> {
    const ref = this.getDocRef(userId);
    try {
      // TODO: strict type: replace (tx: any) with proper Firebase transaction type
      const res = await runTransaction(db, async (tx: any) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
          // No quota document -> deny
          return false;
        }
        const data = snap.data() as any;
        const allowed = data.allowed ?? 0;
        const used = data.used ?? 0;
        // TODO: strict type: replace (data.expiresAt as any) with proper Timestamp cast
        const expiresAt = data.expiresAt ? (data.expiresAt as any) : null;

        // If there's an expiry and it's passed, deny (caller should reset via setQuota)
        if (expiresAt && expiresAt.toDate() < new Date()) {
          return false;
        }

        if (used >= allowed) return false;

        tx.update(ref, { used: used + 1, updatedAt: serverTimestamp() });
        return true;
      });

      return res;
    } catch (error) {
      console.error('CVQuotaService.consumeQuota error', error);
      return false;
    }
  }

  /**
   * For admin or purchase flow: increment used down (reset or restore) or reset used to 0.
   */
  static async resetUsage(userId: string) {
    const ref = this.getDocRef(userId);
    await setDoc(ref, { used: 0, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export default CVQuotaService;
