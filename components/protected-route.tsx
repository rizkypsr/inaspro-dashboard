"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) {
  const { user, userData, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user is authenticated, redirect to login
      if (!user) {
        router.push("/login");

        return;
      }

      // If admin is required but user is not admin, redirect to login
      if (requireAdmin && !isAdmin) {
        router.push("/login");

        return;
      }
    }
  }, [user, userData, loading, isAdmin, requireAdmin, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner color="primary" size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or not admin
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = true,
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
