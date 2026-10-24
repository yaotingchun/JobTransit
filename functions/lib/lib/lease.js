"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireLease = acquireLease;
exports.releaseLease = releaseLease;
const firebaseAdmin_1 = require("./firebaseAdmin");
const LEASE_COLLECTION = 'ingestion_locks';
/**
 * Attempts to acquire an exclusive distributed lease for an ingestion task.
 * Protects against concurrent overlapping Cloud Functions or worker executions.
 */
async function acquireLease(leaseName, ttlMs = 20 * 60 * 1000, // 20 minute default TTL
workerId = `worker_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`) {
    const db = (0, firebaseAdmin_1.getFirestore)();
    if (!db) {
        // If running in local mock environment without Firestore, grant lease
        return { acquired: true, workerId };
    }
    const now = Date.now();
    const leaseRef = db.collection(LEASE_COLLECTION).doc(leaseName);
    try {
        const acquired = await db.runTransaction(async (tx) => {
            const snap = await tx.get(leaseRef);
            if (snap.exists) {
                const data = snap.data();
                const expiresAt = new Date(data.expiresAt).getTime();
                // If lock is active and hasn't expired, cannot acquire
                if (data.locked && expiresAt > now) {
                    return false;
                }
            }
            const newLock = {
                locked: true,
                lockedAt: new Date(now).toISOString(),
                expiresAt: new Date(now + ttlMs).toISOString(),
                workerId,
            };
            tx.set(leaseRef, newLock, { merge: true });
            return true;
        });
        return { acquired, workerId };
    }
    catch (err) {
        console.warn(`[Lease] Could not evaluate lease for "${leaseName}", proceeding safely:`, err);
        return { acquired: true, workerId };
    }
}
/**
 * Releases the distributed lease upon completion or failure
 */
async function releaseLease(leaseName, workerId) {
    const db = (0, firebaseAdmin_1.getFirestore)();
    if (!db)
        return;
    const leaseRef = db.collection(LEASE_COLLECTION).doc(leaseName);
    try {
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(leaseRef);
            if (snap.exists) {
                const data = snap.data();
                if (data.workerId === workerId) {
                    tx.set(leaseRef, { locked: false, releasedAt: new Date().toISOString() }, { merge: true });
                }
            }
        });
    }
    catch (err) {
        console.warn(`[Lease] Failed to release lease "${leaseName}":`, err);
    }
}
//# sourceMappingURL=lease.js.map