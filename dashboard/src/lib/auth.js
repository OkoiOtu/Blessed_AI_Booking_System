'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import pb from './pb';
import { logEvent } from './activityLog';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    pb.collection('users').authRefresh()
      .then(auth => {
        if (auth.record?.suspended) {
          pb.authStore.clear();
          setUser(null);
        } else {
          setUser(auth.record);
        }
      })
      .catch(() => pb.authStore.clear())
      .finally(() => setLoading(false));

    return unsub;
  }, []);

  async function login(email, password) {
    const auth = await pb.collection('users').authWithPassword(email, password);

    // Block suspended users
    if (auth.record?.suspended) {
      pb.authStore.clear();
      // Log the suspended attempt
      const name = auth.record.full_name || auth.record.email;
      await logEvent(
        'login_suspended',
        name,
        `Suspended account attempted login: ${auth.record.email}`
      );
      throw new Error('SUSPENDED');
    }

    // Log successful login
    const name = auth.record.full_name || auth.record.email;
    await logEvent(
      'login_success',
      name,
      `${auth.record.email} signed in successfully`
    );

    setUser(auth.record);
    return auth.record;
  }

  function logout() {
    pb.authStore.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function getInitials(user) {
  if (!user) return '?';
  if (user.full_name) {
    return user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return user.email?.[0]?.toUpperCase() ?? '?';
}

export function getDisplayName(user) {
  if (!user) return '';
  return user.full_name || user.email || '';
}
