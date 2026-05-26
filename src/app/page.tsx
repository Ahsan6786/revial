"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Mic, Shield, TrendingUp, LogOut, ArrowRight,
  Zap, Globe, ChevronRight, Activity, Command,
  Cpu, Layers, Volume2, Fingerprint, BarChart3,
  Dna, Play, Pause, Sparkles, MoveRight, LayoutGrid,
  Flame, Book, Wand2, FastForward, ArrowUpRight, ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthModal } from "@/components/auth-modal";
import { SignOutModal } from "@/components/sign-out-modal";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BlogSection from "@/components/BlogSection";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";




// --- MAIN COMPONENT ---
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stay = searchParams.get("stay");
  const { user, loading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGlow, setShowGlow] = useState(false);

  const showcaseBg = "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(14, 116, 144, 0.08) 45%, rgba(2, 2, 2, 1) 85%)";

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setShowGlow(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 35;
    const y = (clientY / window.innerHeight - 0.5) * 35;
    setMousePosition({ x, y });
  };


  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (mounted && !loading && user && !stay) {
        const userDocRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userDocRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (!data.onboarded) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        } else {
          // New user
          await setDoc(userDocRef, {
            streak: 0,
            onboarded: false,
            lastActivityDate: ""
          }, { merge: true });
          router.push("/onboarding");
        }
      }
    };

    checkUserAndRedirect();
  }, [user, loading, mounted, router, stay]);



  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#F5F5F5] dark:bg-[#020202] text-zinc-900 dark:text-zinc-100 selection:bg-yellow-400 selection:text-black overflow-x-hidden transition-colors duration-300"
    >


      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SignOutModal 
        isOpen={isSignOutModalOpen} 
        onClose={() => setIsSignOutModalOpen(false)} 
        onConfirm={() => {
          logout();
          setIsSignOutModalOpen(false);
        }} 
      />

      {/* --- NAVIGATION --- */}
      <nav className="absolute top-0 w-full z-[100] pt-1 md:pt-2">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between py-0">
            <Link href="/" className="flex items-center">
              <Image src="/splash.png" alt="Logo" width={400} height={120} className="w-auto h-16 md:h-32" priority />
            </Link>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-transparent text-white border border-white/20 px-6 py-2 rounded-full font-light text-xs uppercase tracking-widest hover:border-white/40 active:scale-95 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard" 
                    className="bg-transparent text-white border border-white/20 px-6 py-2 rounded-full font-light text-xs uppercase tracking-widest hover:border-white/40 active:scale-95 transition-all cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => setIsSignOutModalOpen(true)} className="text-zinc-500 hover:text-white"><LogOut size={20} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 md:pt-36 overflow-x-hidden bg-black [--light-w-1:max(120vw,450px)] [--light-h-1:90vh] md:[--light-w-1:155vw] md:[--light-h-1:70vh] [--light-w-2:max(160vw,650px)] [--light-h-2:110vh] md:[--light-w-2:195vw] md:[--light-h-2:85vh] [--light-w-3:max(200vw,850px)] [--light-h-3:130vh] md:[--light-w-3:235vw] md:[--light-h-3:100vh]">
        {/* Subtle Noise / Grain Overlay */}
        <div className="absolute inset-0 noise-bg mix-blend-overlay opacity-[0.02] pointer-events-none z-[1]" />

        {/* --- LUXURY CINEMATIC GLOW (x.ai/api DIRECT REPLICA) --- */}
        {/* Container for cinematic glow, slowly fades in once showGlow is true */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showGlow ? 1 : 0 }}
          transition={{ duration: 6.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 pointer-events-none z-0"
        >
          {/* Layer 1 — Core Bright White Flare (Massive Spread, Responsive Mobile Sizing) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: [0.9, 1, 0.97, 1, 0.97], scale: [0.97, 1, 0.99, 1, 0.99] }}
            transition={{ duration: 28, times: [0, 0.22, 0.45, 0.75, 1], ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: "radial-gradient(ellipse var(--light-w-1) var(--light-h-1) at 100% 50%, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 235, 0.8) 20%, rgba(245, 225, 180, 0.4) 45%, transparent 75%)"
            }}
          />

          {/* Layer 2 — Golden Mid-Glow (Warmer Tone, Responsive Mobile Sizing) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.65, 0.75, 0.68, 0.75, 0.68] }}
            transition={{ duration: 32, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: "radial-gradient(ellipse var(--light-w-2) var(--light-h-2) at 100% 50%, rgba(210, 150, 75, 0.6) 0%, rgba(170, 115, 50, 0.3) 35%, rgba(120, 80, 30, 0.12) 60%, transparent 80%)"
            }}
          />

          {/* Layer 3 — Deep Ambient Warm Fade (Responsive Mobile Sizing) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.5, 0.4, 0.5, 0.4] }}
            transition={{ duration: 36, times: [0, 0.28, 0.52, 0.78, 1], ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: "radial-gradient(ellipse var(--light-w-3) var(--light-h-3) at 100% 50%, rgba(90, 65, 30, 0.4) 0%, rgba(50, 35, 15, 0.15) 45%, transparent 75%)"
            }}
          />
        </motion.div>

        {/* Layer 4 — Darkness Preservation (Left Side Vignette Only to Let Top/Bottom Light Spill) */}
        <div 
          className="absolute inset-y-0 left-0 w-full pointer-events-none z-[1] bg-gradient-to-r from-black via-black/85 via-black/40 to-transparent" 
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center my-auto -translate-y-10 md:-translate-y-16">
          {/* Main content aligned left, leaving right side fully empty for atmospheric light */}
          <div className="max-w-4xl flex flex-col items-start text-left pl-4 md:pl-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
              className="text-5xl md:text-[80px] font-normal leading-none tracking-[-2px] mb-12 uppercase select-none font-sans text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white"
            >
              TALK LESS. <br />
              IMPACT MORE. <br />
              SHINE BRIGHT.
            </motion.h1>

            {/* Grok-style Minimal Pill Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start sm:items-center"
            >
              {!user ? (
                <button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="group bg-white text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white shadow-[0_0_30px_rgba(255,255,255,0.25)] w-fit sm:w-auto"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse" />
                  DASHBOARD <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ) : (
                <Link 
                  href="/dashboard" 
                  className="group bg-white text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-white shadow-[0_0_30px_rgba(255,255,255,0.25)] w-fit sm:w-auto"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a1f] animate-pulse" />
                  DASHBOARD <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}

              <button
                onClick={() => {
                  const el = document.getElementById("blog-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group bg-transparent text-white px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.18em] border border-white/20 hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer w-fit sm:w-auto"
              >
                BLOG <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-10 md:left-24 z-20 flex items-center gap-3">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer flex flex-col items-center gap-1.5"
            onClick={() => {
              const el = document.getElementById("demo-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              } else {
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
              }
            }}
          >
            <ArrowDown size={18} />
            <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-500 uppercase">Scroll</span>
          </motion.div>
        </div>

      </section>

      {/* --- DEMO SECTION --- */}
      <section id="demo-section" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8 uppercase italic leading-tight text-zinc-900 dark:text-white">
            SEE HOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400">REVIAL</span> WORKS.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed mx-auto max-w-xl font-light">
            Master the art of speaking with tools designed for real-world impact. We turn your voice into your greatest asset.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {[
            { 
              imageSrc: "/w.png", 
              title: <>Speak with <br /> Authority</>,
              altText: "Speak with Authority",
              desc: "Instantly hear how you sound and refine your pacing, presence, and impact."
            },
            { 
              imageSrc: "/x.png", 
              title: "Quick Confidence Drills",
              altText: "Quick Confidence Drills",
              desc: "Fast, daily exercises designed to clear hesitation and speak with ease."
            },
            { 
              imageSrc: "/y.png", 
              title: "Step-by-Step Scripting",
              altText: "Step-by-Step Scripting",
              desc: "Follow tailored prompts to deliver your message with absolute clarity."
            }
          ].map((item, i) => (
            <div 
              key={i} 
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-2xl bg-white dark:bg-black group"
            >
              <Image
                src={item.imageSrc}
                alt={item.altText}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                unoptimized
              />
              {/* High-Contrast Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />

              {/* Info Overlay */}
              <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col items-start gap-2">
                <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight leading-[0.95]">{item.title}</h4>
                <p className="text-zinc-300 text-xs md:text-sm font-light leading-relaxed opacity-90">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SHOWCASE: REAL-TIME FEEDBACK --- */}
      <section 
        id="vocal-audit-section" 
        className="w-full py-24 overflow-hidden"
        style={{
          background: showcaseBg
        }}
      >
        <div className="text-center max-w-3xl mx-auto mb-16 px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 uppercase italic leading-tight text-white">
            OWN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">ROOM.</span>
          </h2>
          <p className="text-zinc-200 text-sm md:text-base leading-relaxed mx-auto max-w-xl font-light">
            Command attention, eliminate hesitation, and deliver your message with absolute authority.
          </p>
        </div>
        <div className="relative w-full flex justify-center">
          <Image
            src="/ka.png"
            alt="Vocal Audit Analysis"
            width={1661}
            height={947}
            className="w-[140%] sm:w-full h-auto max-w-none flex-shrink-0"
            priority
          />
        </div>
      </section>

      {/* --- BLOG SECTION --- */}
      <BlogSection />

      {/* --- FOOTER: THE SIGNATURE --- */}
      <footer className="relative pt-40 pb-20 px-6 overflow-hidden bg-black text-zinc-100">
        {/* Subtle top border gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Layered Cinematic Bottom Glow (Golden & Champagne Sunset Atmosphere) */}
        <>
          {/* Layer 1: Broad Deep Gold Ambient (High opacity) */}
          <div 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{
              background: "radial-gradient(circle at 50% 100%, rgba(120, 80, 30, 0.3) 0%, rgba(90, 65, 30, 0.08) 50%, transparent 100%)"
            }}
          />
          {/* Layer 2: Medium Golden Diffused Glow (High opacity) */}
          <div 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{
              background: "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(210, 150, 75, 0.35) 0%, rgba(120, 80, 30, 0.1) 60%, transparent 100%)"
            }}
          />
          {/* Layer 3: Linear bottom-to-top Gold transition */}
          <div 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{
              background: "linear-gradient(to top, rgba(210, 150, 75, 0.22) 0%, rgba(245, 225, 180, 0.05) 50%, transparent 100%)"
            }}
          />
          {/* Layer 4: Intense Bottom-Most Bright Champagne Highlight */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[260px] pointer-events-none z-0" 
            style={{
              background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(245, 225, 180, 0.45) 0%, rgba(210, 150, 75, 0.18) 60%, transparent 100%)"
            }}
          />
          {/* Layer 5: Fine bottom glowing horizontal borders (Golden/Sunset Gradient) */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-10 bg-gradient-to-r from-transparent via-amber-500/40 via-yellow-400/60 via-amber-200/80 via-yellow-400/60 via-amber-500/40 to-transparent blur-[1px]"
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none z-10 bg-gradient-to-r from-transparent via-amber-500/80 via-yellow-400 via-amber-200 via-yellow-400 via-amber-500/80 to-transparent"
          />
        </>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="md:col-span-2">
              <Image src="/splash.png" alt="Logo" width={180} height={50} className="mb-10 opacity-80" />
              <p className="text-zinc-500 text-xl max-w-sm mb-10 leading-relaxed">Forging the next generation of global leaders through the power of peak communication.</p>
              <div className="flex gap-6">
                <Link 
                  href="https://www.instagram.com/revial01?igsh=bWFvaWhoaHF1bjYz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform cursor-pointer group"
                >
                  <Image 
                    src="/insta.png" 
                    alt="Instagram" 
                    width={40} 
                    height={40} 
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              </div>
            </div>

            <div>
              <h5 className="text-zinc-400 font-semibold uppercase text-[10px] tracking-[0.3em] mb-8">Access</h5>
              <ul className="space-y-4 text-zinc-400 font-bold text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-white">Pricing: FREE (FOR NOW)</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-zinc-400 font-semibold uppercase text-[10px] tracking-[0.3em] mb-8">Legal</h5>
              <ul className="space-y-4 text-zinc-400 font-bold text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security Protocol</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-[0.5em]">©2026 REVIAL</p>
              <div className="hidden md:block w-[1px] h-3 bg-white/10" />
              <p className="text-zinc-300 font-semibold text-[10px] uppercase tracking-[0.5em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
                Founder: Ahsan Imam Khan
              </p>
              <div className="hidden md:block w-[1px] h-3 bg-white/10" />
              <Link 
                href="https://www.webiss.shop/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-[0.5em] transition-colors"
              >
                Developed by Webis Labs
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">System Status: All Engines Nominal</span>
            </div>
          </div>
        </div>
      </footer>

      {/* High-Impact Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes voice-flow {
          0%, 100% { transform: scaleY(1); opacity: 0.4; filter: blur(0.5px); }
          50% { transform: scaleY(2.8); opacity: 1; filter: blur(0px); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-voice-flow {
          animation: voice-flow 0.8s ease-in-out infinite;
        }
        body {
          overscroll-behavior: none;
        }
        ::selection {
          background: #FFD700;
          color: black;
        }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />
    </div>
  );
}
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}
