"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";


import { X, Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { loginWithEmail, signupWithEmail, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  if (!mounted) return null;

  return createPortal(
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 touch-none">
          <div
            
            
            
            
            onClick={onClose}
            className="absolute inset-0 bg-black/80 supports-[backdrop-filter]:"
          />

          <div
            className="relative w-full max-w-md bg-background border border-border rounded-[2.5rem] p-8 md:p-10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <img src="/splash.png" alt="REVIAL Logo" className="w-32 h-32 object-contain mb-2" />
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
                {isLogin ? "Welcome Back." : "Create Account."}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  required={isLogin}
                />
              </div>

              {isLogin && (
                <div className="flex justify-end pr-2">
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError("Please enter your email first.");
                        return;
                      }
                      try {
                        await resetPassword(email);
                        setError("Success: Password reset email sent! Check your spam folder and mark it as 'Not Spam' for the link to work.");
                      } catch (err: any) {
                        setError(err.message);
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && (
                <p className={cn(
                  "text-sm font-medium text-center",
                  error.includes("Success") ? "text-emerald-500" : "text-red-500"
                )}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background hover:opacity-90 py-4 rounded-full font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg uppercase tracking-widest text-xs"
              >
                {loading ? "PROCESSING..." : isLogin ? "SIGN IN" : "CONTINUE"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>


            <p className="mt-8 text-center text-sm text-muted-foreground font-medium">
              {isLogin ? "New to REVIAL?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-foreground font-black hover:text-primary transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
