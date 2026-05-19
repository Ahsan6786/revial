"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  MessageSquare, 
  TrendingUp, 
  Volume2, 
  RotateCcw,
  Home,
  ShieldAlert,
  Gauge,
  Sparkles,
  ChevronRight,
  User,
  StopCircle,
  Download,
  Share2,
  BookOpen,
  LayoutGrid,
  Mic,
  ArrowLeft
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { computeSessionAnalytics } from "@/lib/session-analytics";
import { detectFillers, getTotalFillers, getFillerCategories } from "@/lib/filler-detector";

interface FeedbackData {
  confidence_score: number;
  clarity_score: number;
  fluency_score: number;
  tone_score: number;
  feedback_summary: string;
  mistakes: string[];
  improvement_tips: string[];
  better_version: string;
  tone_analysis: string;
  filler_words_detected: number;
  pace_feedback: string;
  vocab_words: { word: string; meaning: string }[];
  per_answer_summaries?: string[];
  ideal_answers?: string[];
}

let activeFetchPromise: Promise<any> | null = null;
let activeFetchTranscript: string | null = null;

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [brutalMode, setBrutalMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const downloadPDF = async () => {
    if (!data) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("REVIAL Performance Audit", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 28);
    
    doc.setFontSize(16);
    doc.text("Scores", 20, 45);
    doc.setFontSize(12);
    doc.text(`Confidence: ${data.confidence_score}%`, 25, 55);
    doc.text(`Clarity: ${data.clarity_score}%`, 25, 62);
    doc.text(`Fluency: ${data.fluency_score}%`, 25, 69);
    doc.text(`Style Score: ${data.tone_score}%`, 25, 76);
    
    doc.setFontSize(16);
    doc.text("My Thoughts", 20, 95);
    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(data.feedback_summary, 170);
    doc.text(splitSummary, 20, 105);
    
    let yPos = 105 + (splitSummary.length * 6) + 10;
    doc.setFontSize(16);
    doc.text("Words to Learn", 20, yPos);
    doc.setFontSize(11);
    yPos += 10;
    data.vocab_words.forEach((v) => {
      doc.text(`- ${v.word}: ${v.meaning}`, 25, yPos);
      yPos += 7;
    });

    yPos += 10;
    doc.setFontSize(16);
    doc.text("What to fix", 20, yPos);
    doc.setFontSize(11);
    yPos += 10;
    data.mistakes.forEach((m) => {
      const splitM = doc.splitTextToSize(`- ${m}`, 160);
      doc.text(splitM, 25, yPos);
      yPos += (splitM.length * 6);
    });

    yPos += 10;
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFontSize(16);
    doc.text("Try saying this", 20, yPos);
    doc.setFontSize(11);
    yPos += 10;
    const splitBetter = doc.splitTextToSize(`"${data.better_version}"`, 170);
    doc.text(splitBetter, 20, yPos);

    doc.save(`REVIAL_Audit_${new Date().getTime()}.pdf`);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (authLoading || !user) return;

      const transcript = sessionStorage.getItem("last_transcript");
      const prompt = sessionStorage.getItem("last_prompt");
      const isRapidFire = sessionStorage.getItem("is_rapid_fire") === "true";
      const rapidFireData = JSON.parse(sessionStorage.getItem("rapid_fire_data") || "[]");
      const cachedResult = sessionStorage.getItem("last_result");

      if (!transcript || !prompt) {
        router.push("/dashboard");
        return;
      }

      if (cachedResult) {
        const parsed = JSON.parse(cachedResult);
        if (parsed.transcript === transcript && parsed.prompt === prompt) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }

      // Use shared promise to prevent double fetch and double save in Strict Mode
      if (activeFetchTranscript === transcript && activeFetchPromise) {
        setLoading(true);
        try {
          const feedback = await activeFetchPromise;
          setData(feedback);
          return;
        } catch (err) {
          console.error("Shared fetch failed:", err);
          setError("Something went wrong.");
          return;
        } finally {
          setLoading(false);
        }
      }

      if (!activeFetchPromise || activeFetchTranscript !== transcript) {
        activeFetchTranscript = transcript;
        activeFetchPromise = (async () => {
          const endpoint = isRapidFire ? "/api/analyze-rapid" : "/api/analyze";
          const body = isRapidFire 
            ? { answers: rapidFireData, brutalMode }
            : { transcript, prompt, brutalMode };

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!response.ok) throw new Error("API failed");
          const feedback = await response.json();

          // Save to Firestore ONLY ONCE in the initiator!
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          const analytics = computeSessionAnalytics(transcript || "", 60);

          await addDoc(collection(db, "users", user.uid, "sessions"), {
            prompt,
            transcript,
            feedback,
            timestamp: serverTimestamp(),
            brutalMode,
            isRapidFire,
            scores: {
              confidence_score: feedback.confidence_score ?? 0,
              clarity_score: feedback.clarity_score ?? 0,
              fluency_score: feedback.fluency_score ?? 0,
              tone_score: feedback.tone_score ?? 0,
            },
            fillers: analytics.fillers,
            meta: analytics.meta,
          });

          // Update user's answeredQuestions list in Firestore to avoid duplicate questions
          const currentAnswered = userDoc.exists() ? (userDoc.data().answeredQuestions || []) : [];
          if (prompt && !currentAnswered.includes(prompt) && prompt !== "Mirror Mode Session") {
            await setDoc(userDocRef, {
              answeredQuestions: [...currentAnswered, prompt]
            }, { merge: true });
          }

          const todayStr = new Date().toDateString();
          const lastDateStr = userDoc.exists() ? userDoc.data().lastDate : null;
          
          if (lastDateStr !== todayStr) {
            let newStreak = (userDoc.data()?.streak || 0) + 1;
            if (lastDateStr) {
              const lastDate = new Date(lastDateStr);
              const now = new Date();
              const diffDays = Math.ceil(Math.abs(now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays > 1) newStreak = 1;
            } else {
              newStreak = 1;
            }

            await updateDoc(userDocRef, {
              streak: newStreak,
              lastDate: todayStr
            });
          }

          return feedback;
        })();
      }

      setLoading(true);
      try {
        const feedback = await activeFetchPromise;
        setData(feedback);
        
        sessionStorage.setItem("last_result", JSON.stringify({
          transcript,
          prompt,
          data: feedback
        }));
      } catch (err) {
        console.error("Analysis failed:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, authLoading, router, brutalMode]);

  const LOADING_PHRASES = [
    "Your journey to mastery is unfolding...",
    "Each word brings you closer to clarity...",
    "The AI is auditing your brilliance...",
    "Transforming your speech into impact...",
    "Almost ready to show you the path to elite communication..."
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
          <div className="relative mb-16">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-card border-2 border-border flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-primary relative z-10 animate-bounce" />
            </div>
            {/* Pulsing Outer Ring */}
            <div className="absolute -inset-4 border border-primary/20 rounded-[3rem] animate-ping opacity-20" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">AI Neuro-Analysis</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none min-h-[120px] md:min-h-[160px] flex items-center justify-center">
              {LOADING_PHRASES[phraseIndex]}
            </h2>

            <p className="text-muted-foreground/60 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
              Measuring Impact & Clarity
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 selection:bg-primary/30">
      <div className="max-w-6xl mx-auto" id="results-content">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-16 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-lg"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <LayoutGrid className="w-5 h-5" />
              MENU
            </button>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              <Download className="w-5 h-5" />
              Download Audit
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
          <ScoreCircle label="Confidence" score={data?.confidence_score || 0} color="text-emerald-500" delay={0.1} />
          <ScoreCircle label="Clarity" score={data?.clarity_score || 0} color="text-pink-500" delay={0.2} />
          <ScoreCircle label="Fluency" score={data?.fluency_score || 0} color="text-orange-500" delay={0.3} />
          <ScoreCircle label="Tone" score={data?.tone_score || 0} color="text-yellow-500" delay={0.4} />
        </div>

        <div 
          
          
          
          className="mb-16"
        >
          <div className="glass-card rounded-[3rem] p-10 md:p-14 border-border/50 bg-muted/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Mic className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">
                {typeof window !== 'undefined' && sessionStorage.getItem("is_rapid_fire") === "true" ? "Rapid Fire Round (6 Questions)" : "Original Transcript"}
              </h3>
            </div>
            <p className="text-2xl md:text-3xl text-foreground font-medium leading-[1.4] italic tracking-tight relative z-10">
              {typeof window !== 'undefined' && sessionStorage.getItem("is_rapid_fire") === "true" 
                ? JSON.parse(sessionStorage.getItem("rapid_fire_data") || "[]").map((d: any, i: number) => `Q${i+1}: ${d.q}`).join(" | ")
                : `"${typeof window !== 'undefined' ? sessionStorage.getItem("last_transcript") : ""}"`
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10">
            {/* OVERALL FEEDBACK */}
            <div 
              
              
              
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative glass-card rounded-[3rem] p-8 md:p-10 border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5  -mr-32 -mt-32" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight italic">Performance Audit</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Comprehensive Verdict</p>
                  </div>
                </div>
                
                <p className="text-xl md:text-2xl text-foreground font-medium leading-[1.4] mb-8 tracking-tight">
                  {data?.feedback_summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                  <StatItem label="Style" value={data?.tone_analysis || "N/A"} icon={<User className="w-5 h-5" />} />
                  <StatItem
                    label="Filler Words"
                    value={(() => {
                      const t = typeof window !== 'undefined' ? sessionStorage.getItem("last_transcript") || "" : "";
                      return getTotalFillers(detectFillers(t)).toString();
                    })()}
                    icon={<Sparkles className="w-5 h-5" />}
                  />
                  <StatItem label="Speed" value={data?.pace_feedback || "Normal"} icon={<Gauge className="w-5 h-5" />} />
                </div>

              </div>
            </div>

            {/* RAPID FIRE BREAKDOWN */}
            {typeof window !== 'undefined' && sessionStorage.getItem("is_rapid_fire") === "true" && data?.per_answer_summaries && (
              <div 
                
                
                
                className="space-y-12"
              >
                <div className="flex items-center justify-between px-4 border-l-4 border-yellow-500 py-3 bg-yellow-500/5 rounded-r-2xl">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic tracking-tight text-foreground">Rapid Fire Drill Report</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Expert Performance Audit</p>
                  </div>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>

                <div className="space-y-12">
                  {JSON.parse(sessionStorage.getItem("rapid_fire_data") || "[]").map((round: any, i: number) => (
                    <div key={i} 
                      
                      
                      
                      className="group bg-card border-2 border-yellow-500/20 rounded-[3rem] overflow-hidden shadow-xl shadow-yellow-500/5 dark:shadow-black/20"
                    >
                      {/* Header */}
                      <div className="bg-yellow-500/5 px-8 py-6 border-b-2 border-yellow-500/10 flex items-center gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-yellow-500 text-white flex items-center justify-center text-xs font-black italic shadow-lg shadow-yellow-500/20">
                          {i+1}
                        </div>
                        <h4 className="text-xl font-bold tracking-tight text-foreground/90">"{round.q}"</h4>
                      </div>

                      <div className="p-8 md:p-10 space-y-10">
                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Your Response</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/50 italic text-foreground/80 leading-relaxed text-base md:text-lg">
                              "{round.a || "No response recorded."}"
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Expert Standard</span>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-primary/5 border-2 border-primary/10 relative italic text-primary font-bold leading-relaxed text-base md:text-lg">
                              <div className="absolute top-4 right-4">
                                <Sparkles className="w-5 h-5 text-primary/30" />
                              </div>
                              "{data.ideal_answers?.[i] || "Perfecting response..."}"
                            </div>
                          </div>
                        </div>

                        {/* Coaching Logic */}
                        <div className="p-6 rounded-[2rem] bg-yellow-500/10 border border-yellow-500/20 shadow-inner">
                           <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-yellow-500 text-white shadow-lg shadow-yellow-500/20">
                              <Lightbulb className="w-5 h-5" />
                            </div>
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400">Expert Coaching Insight</span>
                              <p className="text-sm md:text-base text-foreground/80 font-semibold leading-relaxed">
                                {data.per_answer_summaries?.[i]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILLER WORD BREAKDOWN */}
            {(() => {
              const t = typeof window !== 'undefined' ? sessionStorage.getItem("last_transcript") || "" : "";
              const fillers = detectFillers(t);
              const total = getTotalFillers(fillers);
              const cats = getFillerCategories(fillers);
              if (total === 0) return null;
              return (
                <div className="relative group">
                  <div className="relative glass-card rounded-[2.5rem] p-8 md:p-10 border border-orange-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-[1rem] bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight italic">Filler Word Breakdown</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/70">{total} filler{total !== 1 ? "s" : ""} detected in this session</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {cats.hesitations.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3">🔴 Hesitation Sounds</p>
                          <div className="flex flex-wrap gap-2">
                            {cats.hesitations.map(([word, count]) => (
                              <span key={word} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black">
                                <span className="opacity-70">"{word}"</span>
                                <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] font-black">{count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {cats.discourse.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3">🟠 Discourse Fillers</p>
                          <div className="flex flex-wrap gap-2">
                            {cats.discourse.map(([word, count]) => (
                              <span key={word} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black">
                                <span className="opacity-70">"{word}"</span>
                                <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-black">{count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {cats.hinglish.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3">🟡 Hinglish Fillers</p>
                          <div className="flex flex-wrap gap-2">
                            {cats.hinglish.map(([word, count]) => (
                              <span key={word} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black">
                                <span className="opacity-70">"{word}"</span>
                                <span className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] font-black">{count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-4">
                        💡 Replace each filler with a <span className="text-foreground font-bold">confident 0.5s pause</span> — silence sounds far more authoritative than "uh" or "like".
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* REFINED VERSION */}

            <div 
              
              
              
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-primary/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-card/80 border-l-8 border-l-primary rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-2xl ">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Expert Re-Delivery</h3>
                  </div>
                </div>
                <p className="text-3xl md:text-5xl text-foreground italic font-serif leading-[1.3] tracking-tight">
                  "{data?.better_version}"
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <InfoCard 
              title="What to fix" 
              items={data?.mistakes?.slice(0, 3) || []} 
              icon={<XCircle className="w-6 h-6 text-white" />} 
              delay={0.6}
              className="bg-purple-600 text-white border-purple-500"
              textClass="text-white/90"
            />
            <InfoCard 
              title="How to improve" 
              items={data?.improvement_tips?.slice(0, 3) || []} 
              icon={<Lightbulb className="w-6 h-6 text-white" />} 
              delay={0.7}
              className="bg-cyan-600 text-white border-cyan-500"
              textClass="text-white/90"
            />
            <InfoCard 
              title="Words to Learn" 
              items={data?.vocab_words?.slice(0, 3).map(v => `${v.word}: ${v.meaning}`) || []} 
              icon={<BookOpen className="w-6 h-6 text-white" />} 
              delay={0.8}
              className="bg-emerald-600 text-white border-emerald-500"
              textClass="text-white/90"
            />
            
            <div 
              
              
              
              className="pt-4"
            >
              <button 
                onClick={() => router.push("/dashboard?action=new")}
                className="w-full h-24 rounded-[2rem] bg-white text-black font-black text-2xl hover:scale-[1.03] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
              >
                NEXT LESSON
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCircle({ label, score, color, delay }: { label: string, score: number, color: string, delay: number }) {
  const dashArray = 240;
  const dashOffset = dashArray - (dashArray * score) / 100;

  return (
    <div className="flex flex-col items-center justify-center text-center py-4">
      <div className="relative w-24 h-24 md:w-40 md:h-40 mb-4 group">
        {/* Intense Ambient Glow - Replaced blur with radial gradient to fix square artifact */}
        <div className={cn("absolute inset-0 opacity-20 transition-all duration-700 group-hover:opacity-40", 
          color.includes("emerald") ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.5)_0%,transparent_70%)]" :
          color.includes("pink") ? "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.5)_0%,transparent_70%)]" :
          color.includes("orange") ? "bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.5)_0%,transparent_70%)]" :
          "bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.5)_0%,transparent_70%)]"
        )} />
        
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          {/* Background Ring */}
          <circle 
            cx="50%" cy="50%" r="38%" 
            stroke="currentColor" strokeWidth="8" 
            fill="transparent" className="text-black/10 dark:text-white/5" 
          />
          {/* Progress Ring */}
          <motion.circle
            cx="50%" cy="50%" r="38%" 
            stroke="currentColor" strokeWidth="8" 
            strokeLinecap="round" fill="transparent"
            strokeDasharray={dashArray} 
            initial={{ strokeDashoffset: dashArray }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay }}
            className={cn(color, "drop-shadow-[0_0_8px_currentColor]")}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.5 }}
            className="text-2xl md:text-4xl font-black tracking-tighter"
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] md:text-sm font-black tracking-[0.3em] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{label}</p>
        <p className="text-foreground font-bold">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, items, icon, delay, className, textClass }: { title: string, items: string[], icon: React.ReactNode, delay: number, className?: string, textClass?: string }) {
  return (
    <div 
       
       
       
      className={cn("p-6 rounded-[2rem] border-b-4 bg-card/60 shadow-xl", className)}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-black tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={cn("text-xs font-medium flex gap-2 leading-tight", textClass || "text-muted-foreground")}>
            <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-40 shrink-0"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
