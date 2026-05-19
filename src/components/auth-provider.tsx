"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signOut, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log("Initiating Google Login...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log("Google Login Success:", result.user.email);
    } catch (error: any) {
      console.error("Google Login Error:", error.code, error.message);
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      console.log("Initiating Apple Login...");
      const provider = new OAuthProvider("apple.com");
      const result = await signInWithPopup(auth, provider);
      console.log("Apple Login Success:", result.user.email);
    } catch (error: any) {
      console.error("Apple Login Error:", error.code, error.message);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (loginError: any) {
      try {
        // Attempt automatic sign up if the sign in failed
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch (signupError: any) {
        // If sign up fails because the email is already registered,
        // it means they entered the wrong password for an existing account.
        if (signupError.code === "auth/email-already-in-use") {
          throw loginError;
        }
        throw signupError;
      }
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithApple, loginWithEmail, signupWithEmail, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
