"use client";

import { useState, useEffect, useRef } from "react";

import { ArrowLeft, Play, Pause, RotateCcw, Timer, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function CelebrationConfetti() {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1000]">
      {pieces.map((_, i) => {
        const xStart = Math.random() * 100;
        const xEnd = xStart + (Math.random() * 40 - 20);
        const delay = Math.random() * 0.5;
        const duration = Math.random() * 2 + 1.5;
        const size = Math.random() * 12 + 6;
        const rotation = Math.random() * 360;
        const color = [
          "#F5D061", // gold
          "#E6B325", // amber
          "#10B981", // emerald
          "#3B82F6", // blue
          "#EC4899", // pink
        ][Math.floor(Math.random() * 5)];

        return (
          <motion.div
            key={i}
            initial={{ 
              opacity: 1, 
              y: "105vh", 
              x: `${xStart}vw`, 
              rotate: 0 
            }}
            animate={{ 
              opacity: 0, 
              y: "-10vh", 
              x: `${xEnd}vw`, 
              rotate: rotation + 360 
            }}
            transition={{ 
              duration: duration, 
              delay: delay, 
              ease: "easeOut" 
            }}
            className="absolute rounded-sm"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}

// 60-second targeted paragraph (approx 160-180 words)
const PRACTICE_TEXT = `I have big dreams.
A good job.
Money for my family.
Pride in myself.

English is my key to that better life.

Some days,
I’m tired. Lazy.
Bored looking at books.

But I tell myself:
“Keep going.”

Just 10 minutes with REVIAL.
That’s all I need.

Mistakes?
REVIAL’s AI teacher helps me learn from them.

I don’t need perfection.
I just need to try.

Step by step - Day by day.
REVIAL helps me grow.

When doubt hits,
I remember my goals.

I open REVIAL.
Deep breath. Begin again.

Every sentence I speak?
A small victory.

Every conversation?
One step closer to my dreams.

I’m not competing with others.
Just with yesterday’s version of me.

REVIAL shows me that progress every single day.

One day, I’ll look back and say:
“I did it. I didn’t give up.”

Today, I choose REVIAL.
Because my future starts now.
And I want it to be bright.`;

export default function TeleprompterPage() {
  const [stage, setStage] = useState<"countdown" | "active" | "check" | "finished">("active");
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const scrollPosRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Constants
  const TOTAL_TIME = 45;
  const SCROLL_SPEED = 1.575; // 1.5x speed adjustment

  const startChallenge = () => {
    setStage("active");
    setTimeLeft(TOTAL_TIME);
    scrollPosRef.current = 0;
    setIsPaused(true);
    setResult(null);
    setShowConfetti(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const restart = () => {
    setStage("active");
    setTimeLeft(TOTAL_TIME);
    scrollPosRef.current = 0;
    setIsPaused(true);
    setResult(null);
    setShowConfetti(false);
  };

  const handleYes = () => {
    setShowConfetti(true);
    setResult("win");
    setStage("finished");
  };

  const handleNo = () => {
    setResult("lose");
    setStage("finished");
  };

  // Main Timer and Animation Loop
  useEffect(() => {
    if (stage !== "active" || isPaused) {
      cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastTimestamp = performance.now();

    const animate = (time: number) => {
      const deltaTime = (time - lastTimestamp) / 1000;
      lastTimestamp = time;

      // Update Timer (Only every 100ms to reduce render load)
      setTimeLeft(prev => {
        const next = prev - deltaTime;
        if (next <= 0) {
          setStage("check");
          return 0;
        }
        return next;
      });

      // Update Scroll
      // Target: contentHeight - viewportHeight
      if (scrollRef.current) {
        const contentHeight = scrollRef.current.scrollHeight;
        const viewportHeight = scrollRef.current.clientHeight;
        const targetScroll = contentHeight + viewportHeight; // scroll all the way out
        
        const speed = (contentHeight / TOTAL_TIME) * SCROLL_SPEED;
        scrollPosRef.current += speed * deltaTime;

        // Apply GPU accelerated transform
        scrollRef.current.style.transform = `translateY(-${scrollPosRef.current}px)`;

        if (scrollPosRef.current > contentHeight) {
          setStage("finished");
          setResult("win");
          return;
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [stage, isPaused]);

  return (
    <div className="fixed inset-0 bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_80%)] pointer-events-none" />
      
      {/* Top Header: Navigation & Timer */}
      <header className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Exit</span>
        </Link>
        
        {!(stage === "finished" && result === "win") && (
          <div className="flex flex-col items-center">
              <div className={`text-4xl font-black italic tracking-tighter tabular-nums ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white/90'}`}>
                  {Math.ceil(timeLeft)}s
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Remaining</span>
          </div>
        )}

        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Main Experience Area */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center">
        <>

          {stage === "countdown" && (
            <div 
              key="countdown"
              
              
              
              className="absolute inset-0 flex items-center justify-center bg-black z-[100]"
            >
              <span className="text-[20rem] font-black italic leading-none">{countdown}</span>
            </div>
          )}

          {stage === "active" && (
            <div 
              key="active"
              
              
              className="absolute inset-0 flex flex-col items-center"
            >
              {/* Focus Guides */}
              <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black via-black/90 to-transparent z-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/95 to-transparent z-20 pointer-events-none" />

              {/* Scrolling Window Container */}
              <div 
                className="w-full flex-1 overflow-hidden px-10 relative"
                onClick={() => isPaused && setIsPaused(false)}
              >
                <div 
                  ref={scrollRef}
                  className="w-full flex flex-col items-center  pt-[45vh]"
                  style={{ willChange: 'transform' }}
                >
                  <div className="w-full max-w-4xl text-center pb-[100vh]">
                    <p className="text-[2.5rem] md:text-[4rem] font-black italic leading-[1.2] text-white tracking-tighter opacity-90 whitespace-pre-line">
                      {PRACTICE_TEXT}
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Overlay Removed */}
            </div>
          )}

          {stage === "check" && (
            <div 
              key="check"
              className="max-w-xl w-full text-center space-y-12 px-6 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    TIME ELAPSED
                  </h2>
                  <p className="text-lg sm:text-xl text-white/60 font-semibold">
                    Have you completed the whole paragraph?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleYes}
                  className="p-6 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  Yes, I did!
                </button>
                <button
                  onClick={handleNo}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                >
                  No, not yet
                </button>
              </div>
            </div>
          )}

          {stage === "finished" && (
            <div 
              key="finished"
              className="max-w-xl w-full text-center space-y-12 px-6 relative"
            >
              {showConfetti && <CelebrationConfetti />}

              <div className="space-y-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${result === 'win' ? 'bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-red-500/10 text-red-500'}`}>
                  {result === 'win' ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                </div>
                <div className="space-y-2">
                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                        {result === 'win' ? "HURRAH!" : "FELL BEHIND"}
                    </h2>
                    <p className="text-xl text-white/40 font-medium">
                        {result === 'win' ? "Incredible work! You completed the whole paragraph." : "Your pacing needs work. Try again."}
                    </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startChallenge}
                  className="p-6 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Retry Training
                </button>
                <Link
                  href="/dashboard"
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  Exit Arena
                </Link>
              </div>
            </div>
          )}
        </>
      </main>

      {/* Bottom Controls */}
      {stage === "active" && (
        <footer className="relative z-50 p-8 flex flex-col items-center gap-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex justify-center items-center gap-6 sm:gap-8">
            <button
              onClick={restart}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
              title="Restart"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePause}
              className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              {isPaused ? <Play className="w-10 h-10 fill-current ml-1" /> : <Pause className="w-10 h-10 fill-current" />}
            </button>

            <button
              onClick={() => {
                setIsPaused(true);
                setStage("check");
              }}
              className="px-6 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </button>
          </div>
          
          <div className="text-xs font-black uppercase tracking-widest text-white/20 italic">
            Speed: 1.5x
          </div>
        </footer>
      )}
    </div>
  );
}
