import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

/**
 * Use sessionStorage instead of localStorage so the auth token
 * is wiped when the browser tab/window is closed.
 * This forces a fresh login every time the dashboard is opened.
 */
if (typeof window !== 'undefined') {
  const stored = sessionStorage.getItem('pb_auth');
  if (stored) {
    try {
      const { token, model } = JSON.parse(stored);
      pb.authStore.save(token, model);
    } catch {
      sessionStorage.removeItem('pb_auth');
      pb.authStore.clear();
    }
  } else {
    pb.authStore.clear();
  }

  pb.authStore.onChange((token, model) => {
    if (token && model) {
      sessionStorage.setItem('pb_auth', JSON.stringify({ token, model }));
    } else {
      sessionStorage.removeItem('pb_auth');
    }
  });
}

export default pb;
