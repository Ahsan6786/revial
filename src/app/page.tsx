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




// --- MAIN COMPONENT ---
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stay = searchParams.get("stay");
  const { user, loading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showGlow, setShowGlow] = useState(false);

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
      className="relative min-h-screen bg-[#020202] text-zinc-100 selection:bg-yellow-400 selection:text-black overflow-x-hidden"
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
          className="absolute inset-y-0 left-0 w-full pointer-events-none z-[1]" 
          style={{ background: 'linear-gradient(to right, black 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%)' }}
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
              IMPACT MORE.
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
            <span className="text-[8px] font-mono tracking-[0.2em] text-zinc-600 uppercase">Scroll</span>
          </motion.div>
        </div>

      </section>

      {/* --- DEMO SECTION --- */}
      <section id="demo-section" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8 uppercase italic leading-tight">
            SEE HOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">REVIAL</span> WORKS.
          </h2>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed mx-auto max-w-xl font-light">
            Master the art of speaking with tools designed for real-world impact. We turn your voice into your greatest asset.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {[
            { 
              icon: <Activity className="text-zinc-400 w-5 h-5" />, 
              title: "AI Voice Auditing",
              desc: "Get instant neural feedback on your clarity, tone, and presence.",
              imageSrc: "/s1.webp"
            },
            { 
              icon: <Flame className="text-zinc-400 w-5 h-5" />, 
              title: "Rapid Fire Drills",
              desc: "Intense, quick exercises to eliminate hesitation and speak with ease.",
              imageSrc: "/s2.webp"
            },
            { 
              icon: <Wand2 className="text-zinc-400 w-5 h-5" />, 
              title: "Smart Guidance & Scripting",
              desc: "Follow advanced AI scripts and prompts tailored to your audience.",
              imageSrc: "/s3.webp"
            }
          ].map((item, i) => (
            <div 
              key={i} 
              className="flex flex-col justify-between p-0 rounded-[2rem] bg-zinc-950/10 hover:bg-zinc-950/20 transition-all duration-500 group shadow-2xl backdrop-blur-xl"
            >
              <div>
                {/* Image Container (No Borders) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized
                  />
                  {/* High-Contrast Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10" />

                  {/* Info Overlay (Directly on picture, no borders) */}
                  <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-lg backdrop-blur-md transition-colors duration-300 group-hover:bg-white group-hover:text-black flex-shrink-0">
                      {React.cloneElement(item.icon, { className: "w-5 h-5 transition-colors group-hover:text-black text-white" })}
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight leading-[0.95]">{item.title}</h4>
                    <p className="text-zinc-300 text-xs md:text-sm font-light leading-relaxed opacity-90">{item.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SHOWCASE: REAL-TIME FEEDBACK --- */}
      <section id="vocal-audit-section" className="py-32 px-6 bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8 uppercase italic leading-tight">
              VOCAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">AUDIT.</span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg mb-10 leading-relaxed max-w-lg font-light">Stop guessing how you sound. Get the neural heat-map of your influence the moment you speak.</p>

            <div className="space-y-6">
              {[
                { label: "Vocal Clarity", val: 94 },
                { label: "Command Presence", val: 88 },
                { label: "Emotional Resonance", val: 91 },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-zinc-900/50  border border-white/5 rounded-2xl flex items-center justify-between ">
                  <span className="font-bold text-zinc-300 uppercase tracking-widest text-xs">{stat.label}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        
                        className="h-full bg-white"
                      />
                    </div>
                    <span className="font-semibold text-white">{stat.val}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative group/wave">
            {/* Cinematic background glow behind the card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-amber-500/20 rounded-[2.7rem] blur-2xl opacity-40 group-hover/wave:opacity-80 transition duration-1000" />
            <div className="relative w-full aspect-video bg-black/90 border border-white/10 rounded-[2.5rem] p-4 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/40 opacity-20 pointer-events-none z-10" />
              
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-10">
                {mounted && [...Array(50)].map((_, i) => {
                  // Generate a dynamic, premium colorful gradient across the wave
                  const hueStart = (i * 360) / 50;
                  const hueEnd = (hueStart + 60) % 360;
                  return (
                    <div 
                      key={i}
                      className="w-[3px] md:w-[4px] rounded-full animate-voice-flow transition-all duration-300 group-hover/wave:scale-y-110"
                      style={{ 
                        height: `${20 + Math.sin(i * 0.35) * 30 + Math.random() * 25}%`,
                        animationDelay: `${i * 0.03}s`,
                        animationDuration: `${0.6 + (i % 7) * 0.12}s`,
                        background: `linear-gradient(to top, hsl(${hueStart}, 95%, 50%), hsl(${hueEnd}, 100%, 65%))`,
                        boxShadow: `0 0 12px hsla(${hueStart}, 95%, 50%, 0.5)`
                      }}
                    />
                  );
                })}
              </div>
              
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                <button className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 hover:bg-zinc-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] cursor-pointer">
                  <Play fill="black" size={24} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BLOG SECTION --- */}
      <BlogSection />

      {/* --- FOOTER: THE SIGNATURE --- */}
      <footer className="relative pt-40 pb-20 px-6 overflow-hidden bg-black">
        {/* Subtle top border gradient separator */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Layered Cinematic Bottom Glow (x.ai/api inspired smooth, highly diffused upward atmospheric light) */}
        {/* Layer 1: Broad Deep Indigo/Violet Base Ambient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 100%)"
          }}
        />
        {/* Layer 2: Medium Warm Gold/Orange Diffused Glow */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08) 0%, rgba(236, 72, 153, 0.02) 60%, transparent 100%)"
          }}
        />
        {/* Layer 3: Vibrant Crimson/Rose Mid-Flare */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 100%, rgba(244, 63, 94, 0.08) 0%, rgba(139, 92, 246, 0.02) 80%, transparent 100%)"
          }}
        />
        {/* Layer 4: Intense Bottom-Most Neon-Gold & Sunset Light Spill */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none z-0" 
          style={{
            background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(245, 158, 11, 0.18) 0%, rgba(236, 72, 153, 0.06) 50%, transparent 100%)"
          }}
        />
        {/* Layer 5: Fine bottom glowing horizontal borders (Vibrant Multi-Stop Neon Gradient) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-10 bg-gradient-to-r from-transparent via-violet-500/20 via-pink-500/40 via-amber-400/50 via-pink-500/40 via-violet-500/20 to-transparent blur-[1px]"
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none z-10 bg-gradient-to-r from-transparent via-violet-500/50 via-pink-500/80 via-amber-400/90 via-pink-500/80 via-violet-500/50 to-transparent"
        />

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
              <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.5em]">©2026 REVIAL</p>
              <div className="hidden md:block w-[1px] h-3 bg-white/10" />
              <p className="text-zinc-500 font-semibold text-[10px] uppercase tracking-[0.5em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500/40" />
                Founder: Ahsan Imam Khan
              </p>
              <div className="hidden md:block w-[1px] h-3 bg-white/10" />
              <Link 
                href="https://www.webiss.shop/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.5em] transition-colors"
              >
                Developed by Webis Labs
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Status: All Engines Nominal</span>
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
