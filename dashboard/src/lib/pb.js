import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

// Restore session on load
if (typeof window !== 'undefined') {
  try {
    // Check new key first, then legacy key
    const raw = sessionStorage.getItem('pb_auth') || sessionStorage.getItem('pocketbase_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token  = parsed?.token ?? '';
      const model  = parsed?.model ?? parsed?.record ?? null;
      if (token) pb.authStore.save(token, model);
    }
  } catch {
    // Ignore parse errors
  }
}

// Use sessionStorage so auth clears when browser closes
pb.authStore.onChange(() => {
  if (typeof window === 'undefined') return;

  if (pb.authStore.isValid) {
    sessionStorage.setItem('pb_auth', JSON.stringify({
      token: pb.authStore.token,
      model: pb.authStore.model,
    }));
  } else {
    sessionStorage.removeItem('pb_auth');
  }
});

export default pb;
