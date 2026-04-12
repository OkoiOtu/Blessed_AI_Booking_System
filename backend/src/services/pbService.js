import PocketBase from 'pocketbase';

let pb   = null;
let authPromise = null; // prevents concurrent auth attempts

/**
 * Returns an authenticated PocketBase client.
 * Uses a cached promise to prevent multiple simultaneous re-auth attempts.
 */
export async function getClient() {
  if (!pb) {
    pb = new PocketBase(process.env.POCKETBASE_URL);
  }

  if (!pb.authStore.isValid) {
    await ensureAuth();
  }

  return pb;
}

async function ensureAuth() {
  // If already authenticating, wait for that to finish
  if (authPromise) return authPromise;

  authPromise = pb.collection('_superusers')
    .authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD,
    )
    .then(() => {
      console.info('[pbService] PocketBase authenticated');
      authPromise = null;
    })
    .catch(err => {
      authPromise = null;
      console.error('[pbService] Authentication failed:', err.message);
      throw err;
    });

  return authPromise;
}

/**
 * Proactively refresh the token every 20 minutes.
 * PocketBase tokens last ~30 minutes — this keeps them fresh
 * so the backend never hits an expired token mid-request.
 */
let refreshInterval = null;

export function startTokenRefresh() {
  if (refreshInterval) return;
  refreshInterval = setInterval(async () => {
    if (!pb) return;
    try {
      if (pb.authStore.isValid) {
        await pb.collection('_superusers').authRefresh();
        console.info('[pbService] Token refreshed');
      } else {
        await ensureAuth();
      }
    } catch (err) {
      console.warn('[pbService] Token refresh failed, will re-auth on next request:', err.message);
      pb.authStore.clear(); // force re-auth on next getClient() call
    }
  }, 20 * 60 * 1000); // every 20 minutes
}

// ── calls ──────────────────────────────────────────────────────────────────

export async function createCall(data) {
  const client = await getClient();
  return client.collection('calls').create(data);
}

// ── bookings ───────────────────────────────────────────────────────────────

export async function createBooking(data) {
  const client = await getClient();
  return client.collection('bookings').create(data);
}

export async function markSmsSent(bookingId) {
  const client = await getClient();
  return client.collection('bookings').update(bookingId, { sms_sent: true });
}

// ── leads ──────────────────────────────────────────────────────────────────

export async function createLead(data) {
  const client = await getClient();
  return client.collection('leads').create(data);
}