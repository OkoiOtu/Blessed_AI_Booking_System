/**
 * logEvent — sends an activity log entry to the backend.
 * Used from the dashboard for auth events (login, failed, suspended).
 * Never throws — logging failure must never break the login flow.
 */
export async function logEvent(action, actor, detail) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activity`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action, actor, detail }),
    });
  } catch {
    // Silently ignore — logging is non-critical
  }
}
