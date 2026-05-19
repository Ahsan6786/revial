"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Great_Vibes } from "next/font/google";
import Link from "next/link";

const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });
import {
  LayoutGrid, User, Flame, Clock, TrendingUp, TrendingDown,
  Minus, Mic, Calendar, BarChart2, ChevronRight, Sparkles,
  MessageSquare, ArrowRight, ArrowLeft
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import {
  collection, query, orderBy, limit, getDocs, doc, getDoc
} from "firebase/firestore";
import { ThemeToggle } from "@/components/theme-toggle";
import { computeAverage, computeTrend } from "@/lib/session-analytics";
import { getMostUsedFiller, FillerCounts } from "@/lib/filler-detector";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  prompt?: string;
  transcript?: string;
  timestamp?: any;
  scores?: {
    confidence_score: number;
    clarity_score: number;
    fluency_score: number;
    tone_score: number;
  };
  fillers?: FillerCounts;
  meta?: {
    words_spoken: number;
    speaking_pace_wpm: number;
    duration_seconds: number;
  };
  isRapidFire?: boolean;
  answers?: any[];
  // Legacy support
  feedback?: any;
}

const MOTIVATIONAL_QUOTES = [
  "Your voice is your greatest asset. Train it, refine it, and let it lead you.",
  "Confidence isn't the absence of fear, but the decision that something else is more important.",
  "Great speakers are not born; they are trained. You are on the right path.",
  "Speak with authority, listen with empathy, lead with clarity.",
  "Every pause is an opportunity. Every session is progress. Keep speaking.",
  "Clear speech represents a clear mind. You are building both every day."
];

export default function ProfileClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [joinDate, setJoinDate] = useState<string>("");
  const [estimatedDate, setEstimatedDate] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        const [userDoc, snap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(
            collection(db, "users", user.uid, "sessions"),
            orderBy("timestamp", "desc"),
            limit(50)
          ))
        ]);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name || "");
          
          let estDate = userData.estimatedDate;
          if (!estDate) {
            // Fallback: Default to 60 days from today if missing
            const date = new Date();
            date.setDate(date.getDate() + 60);
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            estDate = date.toLocaleDateString('en-US', options);
          }
          setEstimatedDate(estDate);
        }

        if (user.metadata?.creationTime) {
          const d = new Date(user.metadata.creationTime);
          setJoinDate(d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }));
        }

        setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

        const data: Session[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as Session));
        setSessions([...data].reverse());
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  // ── Computed Metrics ────────────────────────────────────────────────────────

  const getConfidence = (s: Session) =>
    s.scores?.confidence_score ?? s.feedback?.confidence_score ?? 0;
  const getClarity = (s: Session) =>
    s.scores?.clarity_score ?? s.feedback?.clarity_score ?? 0;

  const avgConfidence = computeAverage(sessions, getConfidence);
  const avgClarity = computeAverage(sessions, getClarity);
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + (s.meta?.duration_seconds ?? 60), 0) / 60
  );

  const confidenceTrend = computeTrend(sessions, getConfidence);
  const clarityTrend = computeTrend(sessions, getClarity);

  // Aggregate filler counts
  const aggregatedFillers: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.fillers) {
      Object.entries(s.fillers).forEach(([k, v]) => {
        aggregatedFillers[k] = (aggregatedFillers[k] || 0) + v;
      });
    }
  });

  const topFillers = Object.entries(aggregatedFillers)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Chart data
  const chartData = sessions.slice(-20).map((s, i) => ({
    session: `#${i + 1}`,
    confidence: getConfidence(s),
    clarity: getClarity(s),
    date: s.timestamp?.toDate
      ? s.timestamp.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : `S${i + 1}`,
  }));

  const fillerChartData = topFillers.map(([word, count]) => ({
    word,
    count,
  }));

  // ── Skeleton ─────────────────────────────────────────────────────────────────

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-12 space-y-8">
        <div className="h-16 w-48 rounded-full skeleton" />
        <div className="h-40 rounded-[2.5rem] border border-white/5 skeleton" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-[2rem] border border-white/5 skeleton" />
          ))}
        </div>
        <div className="h-80 rounded-[2.5rem] border border-white/5 skeleton" />
        <div className="h-64 rounded-[2.5rem] border border-white/5 skeleton" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const initials = (userName || user?.displayName || user?.email || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 selection:bg-primary/30">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Header Nav ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link
              href="/dashboard"
              className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              title="Dashboard"
            >
              <LayoutGrid className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">My Account</p>
              <h1 className="text-xl font-black tracking-tighter italic">PROFILE</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* ── User Hero Card (Using card.png with 3D Flip) ── */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-md mx-auto aspect-[1.58/1] select-none"
          style={{ perspective: "1000px", cursor: "pointer" }}
        >
          <div
            className="relative w-full h-full rounded-[1.5rem] shadow-2xl transition-all duration-700 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
          >
            {/* FRONT SIDE */}
            <div
              className="absolute inset-0 rounded-[1.5rem] overflow-hidden flex flex-col justify-between text-white"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(0deg)"
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-[url('/card.png')] bg-cover bg-center" />
              
              {/* Center Logo (Watermark style) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img src="/splash.png" alt="Revial Logo" className="w-16 h-16 md:w-20 md:h-20 opacity-30 object-contain" />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/5" />

              {/* Content Overlay */}
              <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between flex-1">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/50 drop-shadow-sm mb-0.5">Card Holder</p>
                    <h3 className={`${greatVibes.className} text-3xl md:text-4xl font-normal bg-gradient-to-r from-[#F9D976] via-[#E9B646] to-[#C18E28] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
                      {userName || user?.displayName || "Speaker"}
                    </h3>
                  </div>
                  <div />
                </div>

                {/* Bottom Section: Estimation */}
                <div className="flex justify-between items-end mt-auto mb-2 md:mb-4">
                  <div />
                  
                  <div className="text-right">
                    <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/50 drop-shadow-sm mb-0.5">Mastery Date</p>
                    <div className="flex items-center justify-end gap-1 text-white font-bold drop-shadow-md">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span className="text-xs md:text-sm">{estimatedDate || "July 10, 2026"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BACK SIDE (PREMIUM GOLD) */}
            <div
              className="absolute inset-0 rounded-[1.5rem] overflow-hidden flex flex-col justify-between p-6 md:p-8 border text-zinc-950 shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "linear-gradient(135deg, #F9D976 0%, #E9B646 40%, #C18E28 75%, #976912 100%)",
                border: "1.5px solid rgba(255, 223, 128, 0.6)",
                boxShadow: "0 25px 50px -12px rgba(233, 182, 70, 0.25)"
              }}
            >
              {/* Premium metallic sheen overlay */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                style={{
                  background: "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.6) 50%, transparent 55%)",
                  backgroundSize: "200% 200%",
                }} 
              />
              
              {/* Faint watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
                <img src="/splash.png" alt="Revial Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain invert" />
              </div>

              {/* Back side branding */}
              <div className="flex justify-between items-center z-10 border-b border-zinc-950/15 pb-3">
                <span className="text-[9px] font-black tracking-[0.35em] text-zinc-950 uppercase">REVIAL ELITE MASTERY</span>
                <Sparkles className="w-3.5 h-3.5 text-zinc-950 animate-pulse" />
              </div>

              {/* Motivational Quote Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2 z-10 my-auto">
                <p className="text-sm md:text-[15px] font-extrabold leading-relaxed italic text-zinc-950 drop-shadow-sm">
                  "{quote || "Your voice is your greatest asset. Train it, refine it, and let it lead you."}"
                </p>
              </div>

              {/* Back side bottom tag */}
              <div className="flex justify-between items-end z-10 mt-auto pt-3 border-t border-zinc-950/15 text-[8px] font-mono tracking-widest text-zinc-800">
                <span>VIP SPEAKER CARD</span>
                <span className="text-zinc-950 font-black">CLICK TO FLIP BACK</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Key Metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Mic className="w-5 h-5" />}
            label="Sessions"
            value={totalSessions.toString()}
            color="text-primary"
            bg="bg-primary/10"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5" />}
            label="Minutes Spoken"
            value={totalMinutes.toString()}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <MetricCard
            icon={<Sparkles className="w-5 h-5" />}
            label="Avg Confidence"
            value={`${avgConfidence}%`}
            color="text-yellow-500"
            bg="bg-yellow-500/10"
          />
          <MetricCard
            icon={<BarChart2 className="w-5 h-5" />}
            label="Avg Clarity"
            value={`${avgClarity}%`}
            color="text-pink-500"
            bg="bg-pink-500/10"
          />
        </div>

        {/* ── Filler Word Analysis ── */}
        {topFillers.length > 0 && (
          <div className="p-8 rounded-[2.5rem] bg-card/60 border border-white/5 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight">Filler Word Analysis</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Words you overuse</p>
              </div>
            </div>
            <div className="space-y-3">
              {topFillers.map(([word, count]) => (
                <div key={word} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="font-black italic text-foreground">"{word}"</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 rounded-full bg-orange-500/20 overflow-hidden" style={{ width: `${Math.min(120, count * 4)}px` }}>
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                    <span className="text-xs font-black text-orange-500">{count}x</span>
                  </div>
                </div>
              ))}
            </div>
            {topFillers.length > 0 && (
              <p className="text-sm text-muted-foreground italic">
                💡 You overuse <span className="text-foreground font-bold">"{topFillers[0][0]}"</span> the most ({topFillers[0][1]} times). Try replacing it with a confident pause.
              </p>
            )}
          </div>
        )}

        {/* ── Analytics Charts ── */}
        {chartData.length > 1 && (
          <div className="space-y-6">
            {/* Score Over Time */}
            <div className="p-8 rounded-[2.5rem] bg-card/60 border border-white/5 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tight">Score Over Time</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last {chartData.length} sessions</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem", fontSize: 12 }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Confidence" />
                  <Line type="monotone" dataKey="clarity" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Clarity" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Filler Breakdown Bar Chart */}
            {fillerChartData.length > 0 && (
              <div className="p-8 rounded-[2.5rem] bg-card/60 border border-white/5 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tight">Filler Word Totals</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Across all sessions</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={fillerChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="word" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "1rem", fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} name="Total Uses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Performance Trend Engine ── */}
        {sessions.length >= 4 && (
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black italic tracking-tight">Performance Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrendInsight
                label="Confidence"
                trend={confidenceTrend}
                metric={`${avgConfidence}% avg`}
              />
              <TrendInsight
                label="Clarity"
                trend={clarityTrend}
                metric={`${avgClarity}% avg`}
              />
            </div>
          </div>
        )}

        {/* ── Session History ── */}
        {sessions.length > 0 && (
          <div className="p-8 rounded-[2.5rem] bg-card/60 border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tight">Session History</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{totalSessions} total sessions</p>
                </div>
              </div>
              <Link 
                href="/reports" 
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {[...sessions].reverse().slice(0, 10).map((s, i) => {
                const conf = getConfidence(s);
                const clar = getClarity(s);
                const date = s.timestamp?.toDate
                  ? s.timestamp.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "—";
                const mins = Math.round((s.meta?.duration_seconds ?? 60) / 60);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (s.isRapidFire) {
                        sessionStorage.setItem("is_rapid_fire", "true");
                        sessionStorage.setItem("rapid_fire_data", JSON.stringify(s.answers || []));
                        sessionStorage.setItem("last_transcript", s.transcript || "Rapid Fire Session");
                        sessionStorage.setItem("last_prompt", s.prompt || "Rapid Fire Drill");
                        sessionStorage.setItem("last_result", JSON.stringify({
                          transcript: s.transcript,
                          prompt: s.prompt,
                          data: s.feedback || s.scores
                        }));
                      } else {
                        if (!s.transcript || !s.prompt) return;
                        sessionStorage.setItem("is_rapid_fire", "false");
                        sessionStorage.setItem("last_transcript", s.transcript);
                        sessionStorage.setItem("last_prompt", s.prompt);
                        sessionStorage.setItem("last_result", JSON.stringify({
                          transcript: s.transcript,
                          prompt: s.prompt,
                          data: s.feedback || s.scores
                        }));
                      }
                      router.push("/results");
                    }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">
                        #{totalSessions - i}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground line-clamp-1 max-w-[200px]">
                          {s.prompt || "Speaking Session"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">{date} · {mins}m</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex gap-3 text-xs font-black">
                        <span className="text-primary">{conf}%</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-pink-500">{clar}%</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mx-auto">
              <Mic className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-black italic">No Sessions Yet</h2>
            <p className="text-muted-foreground">Complete your first practice session to see analytics here.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-black text-sm hover:scale-105 transition-all mt-4">
              START PRACTICING <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-6 rounded-[2rem] bg-card/60 border border-white/5 shadow-lg hover:shadow-xl transition-shadow space-y-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg, color)}>
        {icon}
      </div>
      <div>
        <p className={cn("text-2xl md:text-3xl font-black tracking-tighter", color)}>{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function TrendBadge({ label, value }: { label: string; value: number }) {
  const isUp = value > 0;
  const isDown = value < 0;
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
      isUp ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
        isDown ? "bg-red-500/10 border-red-500/20 text-red-500" :
          "bg-muted border-border text-muted-foreground"
    )}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {label} {value > 0 ? `+${value}%` : value < 0 ? `${value}%` : "stable"}
    </div>
  );
}

function TrendInsight({ label, trend, metric }: { label: string; trend: number; metric: string }) {
  const isUp = trend > 0;
  const isDown = trend < 0;
  return (
    <div className={cn(
      "p-5 rounded-2xl border",
      isUp ? "bg-emerald-500/5 border-emerald-500/20" :
        isDown ? "bg-red-500/5 border-red-500/20" :
          "bg-muted/30 border-border"
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-lg font-black">{metric}</span>
      </div>
      <p className={cn("text-sm font-bold", isUp ? "text-emerald-500" : isDown ? "text-red-400" : "text-muted-foreground")}>
        {isUp
          ? `↑ Improved ${trend}% over last 7 sessions`
          : isDown
            ? `↓ Declined ${Math.abs(trend)}% over last 7 sessions`
            : "→ Holding steady — keep practising!"}
      </p>
    </div>
  );
}
