import { Firestore } from '@google-cloud/firestore';

/**
 * ============================================================================
 * PERSISTENT GOOGLE OAUTH TOKEN STORE
 * Backed by Firestore so tokens survive restarts/redeploys (the previous
 * plain in-memory Map lost every user's Google session on every restart,
 * which silently broke calendar sync, rescheduling, and email triage).
 * Falls back to memory-only if Firestore is unreachable — e.g. local dev
 * without `gcloud auth application-default login` configured — so local
 * development still works without extra setup.
 * ============================================================================
 */

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'antigravity-499823';
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'agentos';
const COLLECTION = 'googleOAuthTokens';

// Whether credentials are even plausibly available. This matters because a missing-ADC
// error doesn't surface as a normal rejected promise we can try/catch — it happens deep in
// the client's lazy gRPC connection setup and crashes the process outright. So we check
// *before* ever touching Firestore, rather than trying and catching the failure after.
// K_SERVICE is set automatically by Cloud Run (and Cloud Functions); GOOGLE_APPLICATION_CREDENTIALS
// is how you'd point at a local service account key for a machine that isn't Cloud Run.
const credentialsLikelyAvailable = !!(process.env.K_SERVICE || process.env.GOOGLE_APPLICATION_CREDENTIALS);

let db = null;
let firestoreDisabled = !credentialsLikelyAvailable;

if (!credentialsLikelyAvailable) {
  console.warn('[TokenStore] No Google Cloud credentials detected (not running on Cloud Run, no GOOGLE_APPLICATION_CREDENTIALS) — using in-memory token storage only for this run.');
}

function getDb() {
  if (firestoreDisabled) return null;
  if (db) return db;
  try {
    db = new Firestore({ projectId: PROJECT_ID, databaseId: DATABASE_ID });
    return db;
  } catch (err) {
    console.warn('[TokenStore] Could not initialize Firestore, falling back to in-memory only:', err.message);
    firestoreDisabled = true;
    return null;
  }
}

// Fast local cache so most reads never touch Firestore, and the only storage
// used at all if Firestore turns out to be unreachable.
const cache = new Map();

export async function getTokens(email) {
  const key = email || 'default';
  if (cache.has(key)) return cache.get(key);

  const firestore = getDb();
  if (!firestore) return undefined;

  try {
    const snap = await firestore.collection(COLLECTION).doc(key).get();
    if (snap.exists) {
      const tokens = snap.data().tokens;
      cache.set(key, tokens);
      return tokens;
    }
  } catch (err) {
    console.warn(`[TokenStore] Firestore read failed for "${key}", disabling Firestore for this run:`, err.message);
    firestoreDisabled = true;
  }
  return undefined;
}

export async function setTokens(email, tokens) {
  const key = email || 'default';
  cache.set(key, tokens);

  const firestore = getDb();
  if (!firestore) return;

  try {
    await firestore.collection(COLLECTION).doc(key).set({ tokens, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn(`[TokenStore] Firestore write failed for "${key}", disabling Firestore for this run:`, err.message);
    firestoreDisabled = true;
  }
}

export async function deleteTokens(email) {
  const key = email || 'default';
  cache.delete(key);

  const firestore = getDb();
  if (!firestore) return;

  try {
    await firestore.collection(COLLECTION).doc(key).delete();
  } catch (err) {
    console.warn(`[TokenStore] Firestore delete failed for "${key}":`, err.message);
  }
}

export async function hasTokens(email) {
  return !!(await getTokens(email));
}
