// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <div className="admin-page"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="admin-page">
        <h1>Admin</h1>
        <button className="btn-primary" onClick={signIn}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="admin-page">
        <h1>Access Denied</h1>
        <p>You are not authorized to view this page.</p>
        <button className="btn-secondary" onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return <>{children}</>;
}
