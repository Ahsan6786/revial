"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutGrid, Mic, Camera, StopCircle, RefreshCw, 
  ChevronRight, ArrowLeft, Flame, Sparkles, Brain,
  MessageSquare, Trash2, Save, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { detectFillers, FillerCounts } from "@/lib/filler-detector";
import { computeSessionAnalytics } from "@/lib/session-analytics";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MirrorClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    isRecording, transcript, audioBlob, startRecording, stopRecording, clearTranscript, requestPermission 
  } = useVoiceRecorder();

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // App State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [realTimeFillers, setRealTimeFillers] = useState<FillerCounts | null>(null);
  const [lastFiller, setLastFiller] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showSnapshotFlash, setShowSnapshotFlash] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const [showMicPopup, setShowMicPopup] = useState(false);

  const MOTIVATIONAL_PHRASES = [
    "Analyzing your presence...",
    "Breaking down the body language...",
    "Decoding the vocal energy...",
    "Almost there, stay bold.",
    "Your transformation is being calculated..."
  ];

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingPhrase((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const stopCamera = useCallback(() => {
    console.log("stopCamera called");
    setCameraActive(false);
    if (streamRef.current) {
      console.log("Stopping tracks...");
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      try { videoRef.current.load(); } catch (e) {}
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCamera(); // Stop any previous stream
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied. Please check your permissions.");
    }
  }, [stopCamera]);

  // Set video source when active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      
      // Simulate face detection
      setIsScanning(true);
      const timer = setTimeout(() => {
        setFaceDetected(true);
        setIsScanning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cameraActive]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
    
    startCamera();

    return () => {
      console.log("MirrorClient unmounting, stopping camera");
      stopCamera();
    };
  }, [user, authLoading, router, startCamera, stopCamera]);

  // Real-time Filler Detection
  useEffect(() => {
    if (isRecording && transcript) {
      const fillers = detectFillers(transcript);
      setRealTimeFillers(fillers);
      
      // Neuro Engine: Detect HABITS, not just words
      // Check the last 1-3 words to catch multi-word fillers too
      const words = transcript.trim().split(/\s+/);
      const lastWord = words[words.length - 1]?.toLowerCase();
      const lastTwo = words.slice(-2).join(" ").toLowerCase();
      const lastThree = words.slice(-3).join(" ").toLowerCase();

      // Full filler vocab — pure hesitations + common discourse fillers
      const ALERT_FILLERS = [
        "umm", "um", "uh", "er", "ah", "hmm",
        "like", "basically", "actually", "literally",
        "right", "okay", "so", "well",
        "you know", "i mean", "i guess",
        "kind of", "sort of",
        "matlab", "matlab ki", "matlab bolo",
        "woh", "yaar", "toh",
      ];

      const match =
        ALERT_FILLERS.find(f => f === lastThree && fillers[f] > 1) ||
        ALERT_FILLERS.find(f => f === lastTwo   && fillers[f] > 1) ||
        ALERT_FILLERS.find(f => f === lastWord  && fillers[f] > 2);

      if (match) {
        setLastFiller(match);
        setTimeout(() => setLastFiller(null), 3000);
      }
    }
  }, [isRecording, transcript]);

  const grantPermission = async () => {
    setShowMicPopup(false);
    const granted = await requestPermission();
    if (!granted) {
      alert("Microphone access is required to practice. Please enable it in your browser settings.");
      return;
    }
    setHasStarted(true);
    setCountdown(3);
    setFeedback(null);
    setIsSaved(false);
    clearTranscript();
  };

  // Session Management
  const handleStart = async () => {
    setShowMicPopup(true);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      startRecording();
      
      // Take snapshot after 5 seconds of speaking
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            setSnapshot(canvas.toDataURL("image/jpeg", 0.7));
            setShowSnapshotFlash(true);
            setTimeout(() => setShowSnapshotFlash(false), 200);
          }
        }
      }, 5000);
    }
  }, [countdown, startRecording]);

  const saveSession = async (currentFeedback: any) => {
    if (!user || !transcript || !currentFeedback) return null;
    
    try {
      const analytics = computeSessionAnalytics(transcript, 60);
      const docRef = await addDoc(collection(db, "users", user.uid, "sessions"), {
        mode: "mirror",
        prompt: "Mirror Mode Session",
        transcript,
        feedback: currentFeedback,
        timestamp: serverTimestamp(),
        scores: {
          confidence_score: currentFeedback.confidence_score ?? 0,
          clarity_score: currentFeedback.clarity_score ?? 0,
          fluency_score: currentFeedback.fluency_score ?? 0,
          tone_score: currentFeedback.tone_score ?? 0,
        },
        fillers: analytics.fillers,
        meta: analytics.meta,
        snapshot: snapshot // Save the image too!
      });
      return docRef.id;
    } catch (err) {
      console.error("Save error:", err);
      return null;
    }
  };

  const handleStop = async () => {
    stopRecording();
    
    // Safeguard: If no words spoken, just reset
    if (!transcript.trim()) {
      clearTranscript();
      setHasStarted(false);
      return;
    }

    setIsAnalyzing(true);
    
    // 1. Analyze
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          prompt: "Mirror Mode Practice",
          brutalMode: false,
          imageData: snapshot
        })
      });
      const data = await res.json();
      
      // 2. Auto-Save
      const sessionId = await saveSession(data);
      
      // 3. Redirect
      if (sessionId) {
        router.push(`/mirror/results/${sessionId}`);
      } else {
        setFeedback(data);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error("Analysis/Save error:", err);
      setIsAnalyzing(false);
    }
  };

  // Rendering
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-12 text-center space-y-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-20"
        />

        <div className="relative z-10 space-y-12 max-w-2xl">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-[2.5rem] bg-card border border-border flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <RefreshCw size={56} className="text-primary animate-spin" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            </div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.2 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute -inset-8 border-2 border-primary rounded-[3rem] blur-sm"
            />
          </div>
          
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={loadingPhrase}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                  {MOTIVATIONAL_PHRASES[loadingPhrase]}
                </h2>
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-xs">
                Neuro-Engine is Processing your performance
              </p>
              <div className="w-64 h-1.5 bg-card border border-border rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Brain Elements */}
        <div className="absolute bottom-12 right-12 opacity-10 scale-150">
          <Brain size={120} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Header */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowExitModal(true)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all border border-border"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Training Mode</p>
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-foreground">Mirror Mode</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isRecording && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Recording</span>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 grid lg:grid-cols-2 overflow-hidden relative">
        
        {/* Left Panel: Camera View */}
        <div className="relative bg-black flex items-center justify-center border-r border-border overflow-hidden min-h-[40vh] lg:min-h-0">
          {cameraActive ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
            />
          ) : (
            <div className="text-center space-y-4">
              <Camera size={48} className="mx-auto text-zinc-700" />
              <p className="text-zinc-500 font-bold">{cameraError || "Initializing Camera..."}</p>
              {cameraError && (
                <button onClick={startCamera} className="px-6 py-2 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
                  Retry Camera
                </button>
              )}
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 border-[32px] border-black/40 pointer-events-none" />
          
          {/* Scanning Effect */}
          {isScanning && (
            <motion.div 
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-primary/50 blur-sm z-10 pointer-events-none"
            />
          )}

          {/* Face Detection UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={cn(
              "w-[60%] h-[70%] border-2 rounded-[4rem] transition-all duration-1000",
              faceDetected ? "border-emerald-500/40 border-solid" : "border-white/10 border-dashed"
            )}>
              {faceDetected && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                  Face Locked
                </div>
              )}
            </div>
          </div>

          {/* Neural Static Overlay */}
          <AnimatePresence>
            {lastFiller && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-50 border-[20px] border-red-500/10 mix-blend-overlay animate-pulse"
              />
            )}
          </AnimatePresence>

          {/* Corners */}
          <div className="absolute inset-0 p-12 pointer-events-none">
            <div className="absolute top-12 left-12 w-8 h-8 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-12 right-12 w-8 h-8 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-12 left-12 w-8 h-8 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-12 right-12 w-8 h-8 border-b-2 border-r-2 border-white/20" />
          </div>

          {/* Snapshot Flash */}
          <AnimatePresence>
            {showSnapshotFlash && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-[60]"
              />
            )}
          </AnimatePresence>

          {/* Neuro Engine Alerts */}
          <AnimatePresence>
            {lastFiller && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] z-[70] pointer-events-none"
              >
                <div className="relative p-1 bg-red-500 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.4)]">
                  <div className="bg-black/90 backdrop-blur-3xl rounded-[2.4rem] p-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center animate-bounce">
                      <Brain size={32} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-1">Neural Habit Detected</h4>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                        Over-reliance on "{lastFiller}"
                      </h3>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      Your neuro-engine has flagged this as a speech pattern.<br/>Break the habit, speak with authority.
                    </p>
                  </div>
                  {/* Scanning Line */}
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
              >
                <span className="text-[12rem] font-black italic tracking-tighter text-white">
                  {countdown === 0 ? "GO!" : countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial Start Overlay */}
          <AnimatePresence>
            {!hasStarted && cameraActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <button 
                  onClick={handleStart}
                  className="group relative flex flex-col items-center gap-6"
                >
                  <div className="w-32 h-32 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500">
                    <Mic size={48} />
                  </div>
                  <span className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
                    Press Mic Button and Speak
                  </span>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    Click to start training session
                  </p>
                  <div className="absolute -inset-10 border border-white/20 rounded-full animate-ping opacity-20 pointer-events-none" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Feedback & Analysis */}
        <div className="relative bg-background flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* Recording Controls / Feedback Panel */}
            <div className="flex-1 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                {!isRecording && !feedback ? (
                  <motion.div 
                    key="pre-recording"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10 w-full"
                  >
                    {/* Prompt / Instructions */}
                    <div className="space-y-4">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Training Prompt</h2>
                      <div className="p-8 rounded-[2rem] bg-card border border-border">
                        <p className="text-xl font-bold italic leading-relaxed text-foreground/80">
                          "Introduce yourself to the world. Speak for at least <span className="text-primary">60 seconds</span>. Don't hesitate, don't overthink—just speak your truth. Take your time, we're listening."
                        </p>
                      </div>
                    </div>

                    {/* Real-time Transcript Placeholder */}
                    <div className="space-y-4">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Live Transcript</h2>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight leading-relaxed italic text-muted-foreground/30">
                        Your voice will be visualized here as you speak...
                      </p>
                    </div>
                  </motion.div>
                ) : isRecording ? (
                  <motion.div 
                    key="recording"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center justify-center space-y-8 py-20"
                  >
                    <div className="relative">
                      <button 
                        onClick={handleStop}
                        className="px-12 py-5 rounded-full bg-red-500 text-white flex items-center justify-center gap-3 shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:scale-105 transition-all active:scale-95 group relative z-10"
                      >
                        <StopCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="font-black text-sm uppercase tracking-[0.2em]">Stop Recording</span>
                      </button>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 border-2 border-red-500 rounded-full blur-sm"
                      />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Session Active</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 animate-pulse">Speak naturally • AI is listening</p>
                    </div>
                    {/* Compact Transcript during recording */}
                    <div className="max-w-md text-center pt-8">
                      <p className="text-sm font-medium italic text-muted-foreground line-clamp-3">
                        {transcript || "Capturing your thoughts..."}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* AI Analysis View */}
            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 pb-32"
                >
                  <div className="h-[1px] bg-border w-full" />
                  
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-card border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Confidence</p>
                      <p className="text-4xl font-black italic text-primary">{feedback.confidence_score}%</p>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-card border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Clarity</p>
                      <p className="text-4xl font-black italic text-emerald-500">{feedback.clarity_score}%</p>
                    </div>
                  </div>

                  {/* Visual & Talking Style Insights */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-4 group hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Camera size={20} className="text-primary" />
                        <h3 className="font-black italic uppercase tracking-tighter text-xl">Visual Insights</h3>
                      </div>
                      <p className="text-foreground/80 font-medium text-lg leading-relaxed italic">
                        "{feedback.expression_analysis || "Analyzing your visual presence..."}"
                      </p>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 space-y-4 group hover:bg-emerald-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-emerald-500" />
                        <h3 className="font-black italic uppercase tracking-tighter text-xl">Talking Style</h3>
                      </div>
                      <p className="text-foreground/80 font-medium text-lg leading-relaxed italic">
                        "{feedback.tone_analysis || "Evaluating your vocal command..."}"
                      </p>
                    </div>
                  </div>

                  {/* Pace & Fluency */}
                  <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain size={20} className="text-primary" />
                      <h3 className="font-black italic uppercase tracking-tighter text-xl">Coach Feedback</h3>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">{feedback.feedback_summary}</p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Pace Analysis</p>
                      <p className="text-sm text-foreground/80 font-bold">{feedback.pace_feedback}</p>
                    </div>
                  </div>

                  {/* Improvement Areas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Weaknesses</h4>
                      <div className="space-y-2">
                        {feedback.mistakes?.map((m: string, i: number) => (
                          <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <span>{m}</span>
                          </div>
                        )) || <p className="text-xs text-muted-foreground/60">No major weaknesses detected.</p>}
                      </div>
                    </div>
                    <div className="space-y-4 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">How to improve</h4>
                      <div className="space-y-2">
                        {feedback.improvement_tips?.map((t: string, i: number) => (
                          <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            <span>{t}</span>
                          </div>
                        )) || <p className="text-xs text-muted-foreground/60">Keep doing what you're doing!</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Bottom Controls */}
          <div className="p-8 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-center gap-6">
            {feedback && !isSaved && (
              <button 
                onClick={saveSession}
                className="px-10 py-5 rounded-full bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
              >
                <Save size={20} /> SAVE SESSION
              </button>
            )}

            {isSaved && (
              <div className="flex items-center gap-3 text-emerald-500 font-black italic uppercase tracking-widest text-xs px-8 py-5 border border-emerald-500/20 rounded-full">
                <Sparkles size={16} /> SESSION SAVED
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showMicPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMicPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-8">
                <Mic size={40} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Enable Microphone</h2>
              <p className="text-zinc-400 mb-10 font-medium">
                To practice speaking and get AI analysis, we need access to your microphone. This is required for PWAs and some browsers.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={grantPermission}
                  className="w-full py-5 rounded-full bg-[#007AFF] text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-[#007AFF]/20"
                >
                  TURN ON MIC
                </button>
                <button 
                  onClick={() => setShowMicPopup(false)}
                  className="w-full py-5 rounded-full bg-white/5 text-zinc-300 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-8">
                <Camera size={40} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">End Session?</h2>
              <p className="text-zinc-400 mb-10 font-medium">
                Your camera will be automatically closed and your current progress will be lost unless you've saved it.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    // Logic to ensure everything stops
                    stopCamera();
                    stopRecording();
                    router.push("/dashboard");
                  }}
                  className="w-full py-5 rounded-full bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  YES, CLOSE CAMERA
                </button>
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-5 rounded-full bg-white/5 text-zinc-300 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  KEEP PRACTICING
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
