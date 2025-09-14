"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  AuthError,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  photoUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastSignInAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userData?.role === "admin";

  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;

        setUserData(data);
      } else {
        setError("User data not found in database");
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
      setUserData(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user data to check role
      await fetchUserData(result.user);

      // Check if user is admin after fetching data
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;

        if (data.role !== "admin") {
          await signOut(auth);
          throw new Error("Access denied. Admin privileges required.");
        }
      } else {
        await signOut(auth);
        throw new Error("User not found in database.");
      }
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = "An error occurred during sign in";

      switch (authError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        default:
          errorMessage = authError.message || errorMessage;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setError(null);
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    isAdmin,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
