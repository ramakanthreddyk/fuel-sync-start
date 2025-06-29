
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import Login from '@/pages/login';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <Login />;
  }

  return <>{children}</>;
};

export default AuthGuard;
