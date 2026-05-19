"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ARTICLES = [
  {
    id: "0",
    title: "Why Great Talent Still Fails Interviews",
    description: "Many people lose opportunities not because they lack skills, but because they struggle to speak confidently.",
    imageSrc: "/s1.png",
    category: "Speaking Skills",
    readTime: "4 min read",
    overlayText: "Speak With Confidence",
    content: [
      {
        heading: "The Articulation Gap",
        text: "Even the most brilliant minds often face rejection. In the modern workspace, technical mastery is only half the equation. The other half—often the deciding factor—is how you articulate your value. Many highly qualified candidates fail interviews not because they lack technical knowledge, but because they suffer from the 'Articulation Gap.' They know the answers, but they cannot present them in a structured, engaging, and persuasive manner. When asked to explain a complex project or resolve a hypothetical conflict, they ramble, lose focus, or sound unsure of themselves."
      },
      {
        heading: "The Psychology of First Impressions",
        text: "Studies show that interviewers form a preliminary opinion within the first 180 seconds. Factors such as vocal tone and pitch variability, confidence in responding to unexpected questions, and clarity of speech without excessive filler words speak louder than a long list of achievements on a resume. If you sound hesitant, the interviewer unconsciously doubts your competence."
      },
      {
        heading: "Mastering the Narrative",
        text: "To overcome this, you must change how you practice. Start utilizing structured frameworks like the STAR method: state the Situation, describe the Task, detail the Action, and present the concrete Result. Combine this with pacing practice to keep your heart rate down and speaking authority high."
      }
    ]
  },
  {
    id: "1",
    title: "How Poor Speaking Skills Hold People Back",
    description: "Fear, hesitation, and weak communication can make even talented candidates look unprepared.",
    imageSrc: "/s2.png",
    category: "Career Growth",
    readTime: "5 min read",
    overlayText: "Communication Is Power",
    content: [
      {
        heading: "The Invisible Contributor",
        text: "In a globalized professional landscape, your ideas are only as good as your ability to communicate them. If you cannot explain your work, your contribution remains invisible. We have all seen it: a quiet team member does the bulk of the work, but a more vocal colleague takes the credit during presentations. In meetings, promotions, and client negotiations, those who speak with confidence and clarity naturally command attention. Poor speaking skills create a glass ceiling that hard work alone cannot break."
      },
      {
        heading: "The Fear Factor",
        text: "Glossophobia—the fear of public speaking—is one of the most common anxieties in the world. It manifests as a rapid heart rate, mumbling, and mental blocks under pressure. This fear forces talented individuals to avoid speaking up, turning down leadership opportunities, and staying in their comfort zones."
      },
      {
        heading: "How to Reclaim Your Voice",
        text: "Communication is not an innate gift; it is a trainable skill. By recording yourself, analyzing your filler words, and practicing timed impromptu response drills under pressure, you can quickly build the neural confidence needed to present any idea with absolute control."
      }
    ]
  },
  {
    id: "2",
    title: "The Real Difference Between Selection And Rejection",
    description: "The way you speak, present yourself, and communicate often matters more than technical knowledge.",
    imageSrc: "/s3.png",
    category: "Self Improvement",
    readTime: "6 min read",
    overlayText: "Your Voice Matters",
    content: [
      {
        heading: "The Selection Formula",
        text: "When two candidates with identical qualifications apply for the same role, what determines who gets selected? The answer lies in command presence. Selection is rarely about finding the absolute smartest person. It is about finding the person who can lead, collaborate, and represent the company with authority. The difference between selected and rejected candidates often comes down to authority of speech, conceptual clarity, and emotional resonance."
      },
      {
        heading: "Redefining Your Presence",
        text: "Command presence is not about having a loud voice; it is about intentionality. Vary your pitch to keep listeners engaged, maintain open and aligned physical gestures, and structure your responses with clear number-based points ('There are three key reasons why...') to instantly project confidence."
      },
      {
        heading: "Daily Vocal Training",
        text: "Vocal and mental frameworks must be practiced daily to become subconscious habits. Utilizing real-time AI tools that audit your pitch, clarity, and pacing can help you achieve selection-level confidence in a matter of weeks."
      }
    ]
  }
];

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const article = ARTICLES.find((a) => a.id === articleId) || ARTICLES[0];

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-white selection:text-black">
      {/* Back Navigation Button */}
      <Link 
        href="/" 
        className="fixed top-8 left-6 md:left-12 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-black/80 hover:border-white/20 active:scale-95 group shadow-2xl"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
        Back to Home
      </Link>

      {/* --- FULLSCREEN HERO SECTION --- */}
      <section className="relative w-full h-[100vh] flex flex-col justify-end overflow-hidden">
        {/* Fullscreen Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={article.imageSrc} 
            alt={article.title}
            fill 
            className="object-cover object-center scale-105"
            priority
          />
          {/* Rich Cinematic Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-[#020202]/30" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            {/* Category Tag */}
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-300 mb-6 backdrop-blur-md">
              {article.category}
            </span>

            {/* Main Title */}
            <h1 className="text-4xl md:text-7xl font-extrabold uppercase italic tracking-tighter leading-[0.95] text-white mb-6 max-w-4xl">
              {article.title}
            </h1>

            {/* Description (White text describing) */}
            <p className="text-white text-lg md:text-2xl leading-relaxed max-w-3xl font-light mb-8 opacity-90">
              {article.description}
            </p>

            {/* Read Time Info */}
            <div className="flex items-center gap-3 text-zinc-400 text-xs font-semibold uppercase tracking-widest">
              <Clock size={14} />
              <span>{article.readTime}</span>
              <span className="text-zinc-600">•</span>
              <span>Published May 2026</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 right-6 md:right-12 z-20 flex items-center gap-3">
          <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase">Scroll Down to Read</span>
        </div>
      </section>

      {/* --- ARTICLE BODY SECTION --- */}
      <section className="relative bg-[#020202] z-10">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
          
          {/* Article Text Grid */}
          <div className="space-y-16">
            {article.content.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h2 className="text-white font-extrabold text-2xl md:text-3xl uppercase italic tracking-tight flex items-center gap-3">
                  <span className="text-zinc-600 text-sm font-mono">0{idx + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-zinc-300 text-lg leading-relaxed font-light">
                  {section.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-32 p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-zinc-950/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          >
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-[200px] w-[200px] rounded-full bg-white/5 blur-[80px]" />
            
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                <Sparkles size={12} className="text-zinc-400 animate-pulse" /> Try REVIAL Today
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold uppercase italic tracking-tight text-white leading-tight">
                Ready to Speak <br />With Authority?
              </h3>
              <p className="text-zinc-500 text-sm max-w-sm">
                Get real-time feedback on your clarity, tone, and pacing. No credit card required.
              </p>
            </div>

            <Link 
              href="/dashboard" 
              className="group bg-white text-black px-8 py-4 rounded-full font-mono text-xs uppercase tracking-[0.18em] hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 border border-white shadow-[0_0_30px_rgba(255,255,255,0.25)] flex-shrink-0 cursor-pointer"
            >
              Dashboard <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Footer Signature */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.5em]">©2026 REVIAL • ALL RIGHTS RESERVED</p>
          <Link href="/" className="text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.5em] transition-colors">
            Back to Homepage
          </Link>
        </div>
      </footer>
    </div>
  );
}
