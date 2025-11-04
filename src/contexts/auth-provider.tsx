"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// The following imports are commented out as we are not using Firebase Auth
// import type { User } from "firebase/auth";
// import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "@/firebase/config";
// import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  // const { toast } = useToast();

  const signInWithGoogle = async () => {
    console.log("Signing in with Google is disabled for now.");
    // In a real app, you would implement this
  };

  const logOut = async () => {
    console.log("Logging out is disabled for now.");
    // In a real app, you would implement this
  };

  const value = { user, loading, signInWithGoogle, logOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
