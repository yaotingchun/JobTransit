import { getFirestore } from './firebaseAdmin'

export interface FencedIngestionLock {
  locked: boolean
  lockedAt: string
  expiresAt: string
  workerId: string
  fencingToken: number
  releasedAt?: string
}

const LEASE_COLLECTION = 'ingestion_locks'

/**
 * Attempts to acquire an exclusive distributed lease with a monotonic Fencing Token.
 * Protects against overlapping Cloud Functions, duplicate LLM calls, and stale writes.
 */
export async function acquireLease(
  leaseName: string,
  ttlMs = 10 * 60 * 1000, // 10 minute default TTL
  workerId = `worker_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
): Promise<{ acquired: boolean; workerId: string; fencingToken: number }> {
  const db = getFirestore()
  if (!db) {
    return { acquired: true, workerId, fencingToken: 1 }
  }

  const now = Date.now()
  const leaseRef = db.collection(LEASE_COLLECTION).doc(leaseName)

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(leaseRef)
      let prevToken = 0

      if (snap.exists) {
        const data = snap.data() as FencedIngestionLock
        const expiresAt = new Date(data.expiresAt).getTime()
        prevToken = data.fencingToken || 0

        // If lock is still valid and active, refuse acquisition
        if (data.locked && expiresAt > now) {
          return { acquired: false, workerId: data.workerId, fencingToken: prevToken }
        }
      }

      const nextToken = prevToken + 1
      const newLock: FencedIngestionLock = {
        locked: true,
        lockedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + ttlMs).toISOString(),
        workerId,
        fencingToken: nextToken,
      }

      tx.set(leaseRef, newLock, { merge: true })
      return { acquired: true, workerId, fencingToken: nextToken }
    })

    return result
  } catch (err) {
    console.warn(`[Lease] Could not evaluate lease for "${leaseName}", proceeding safely:`, err)
    return { acquired: true, workerId, fencingToken: 1 }
  }
}

/**
 * Validates that the worker's fencing token is still active and has not expired or been overtaken
 */
export async function verifyLease(
  leaseName: string,
  workerId: string,
  fencingToken: number
): Promise<boolean> {
  const db = getFirestore()
  if (!db) return true

  const leaseRef = db.collection(LEASE_COLLECTION).doc(leaseName)
  try {
    const snap = await leaseRef.get()
    if (!snap.exists) return false
    const data = snap.data() as FencedIngestionLock
    const expiresAt = new Date(data.expiresAt).getTime()
    return (
      data.locked &&
      data.workerId === workerId &&
      data.fencingToken === fencingToken &&
      expiresAt > Date.now()
    )
  } catch (err) {
    console.warn(`[Lease] Error verifying lease "${leaseName}":`, err)
    return true
  }
}

/**
 * Releases the distributed lease upon completion
 */
export async function releaseLease(
  leaseName: string,
  workerId: string,
  fencingToken?: number
): Promise<void> {
  const db = getFirestore()
  if (!db) return

  const leaseRef = db.collection(LEASE_COLLECTION).doc(leaseName)
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(leaseRef)
      if (snap.exists) {
        const data = snap.data() as FencedIngestionLock
        if (data.workerId === workerId && (!fencingToken || data.fencingToken === fencingToken)) {
          tx.set(leaseRef, { locked: false, releasedAt: new Date().toISOString() }, { merge: true })
        }
      }
    })
  } catch (err) {
    console.warn(`[Lease] Failed to release lease "${leaseName}":`, err)
  }
}
