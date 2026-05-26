"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  imageSrc: string;
  overlayText: string;
  category: string;
  title: string;
  description: string;
  index: number;
}

const BlogCard = ({
  imageSrc,
  overlayText,
  category,
  title,
  description,
  index,
}: BlogCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number], // Premium easeOutCubic
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      className="group w-full h-[440px] [perspective:1000px] cursor-pointer"
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* --- FRONT SIDE --- */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] border border-zinc-200/50 dark:border-white/20 bg-zinc-950/40 overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Card background image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              priority={index === 0}
              unoptimized
            />
            {/* Deep gradient overlay to make the bottom text highly readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />
          </div>

          {/* Upper left category badge on front */}
          <div className="absolute top-6 left-6 z-20">
            <span className="inline-block rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md">
              {overlayText}
            </span>
          </div>

          {/* Lower text section at the front */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400">
              {category}
            </span>
            <h3 className="text-xl font-extrabold uppercase italic leading-tight tracking-tight text-white md:text-2xl">
              {title}
            </h3>
          </div>
        </div>

        {/* --- BACK SIDE --- */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] border border-zinc-200 dark:border-white/20 bg-white dark:bg-zinc-950 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between transition-colors duration-300">
          <div className="flex flex-col gap-4 mt-2 text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              {category}
            </span>
            <h3 className="text-lg font-black uppercase italic leading-tight tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h3>
            {/* Split divider */}
            <div className="w-12 h-[2px] bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full" />
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
              {description}
            </p>
          </div>

          {/* Flip back note */}
          <div className="flex items-center justify-end text-zinc-400 dark:text-zinc-500 border-t border-black/5 dark:border-white/5 pt-4">
            <span className="text-[9px] font-bold tracking-widest uppercase">Click to flip</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function BlogSection() {
  const blogs = [
    {
      imageSrc: "/p1.png",
      overlayText: "Speak With Confidence",
      category: "Speaking Skills",
      title: "Why Great Talent Still Fails Interviews",
      description:
        "Many brilliant candidates fall short in interviews not due to a lack of technical knowledge, but because they struggle to structure their thoughts under pressure. When hesitation creeps in and confidence wavers, even the most impressive resumes lose their impact. Mastery of vocal delivery, clear articulation, and absolute confidence are the final keys to turning your hard-earned expertise into a successful job offer.",
    },
    {
      imageSrc: "/p2.png",
      overlayText: "Communication Is Power",
      category: "Career Growth",
      title: "How Poor Speaking Skills Hold People Back",
      description:
        "Weak verbal presence, frequent pause words, and vocal insecurity create an invisible barrier to career advancement. When you speak with hesitation, others perceive it as a lack of preparation or competence, regardless of your actual brilliance. Elevating your communication skills enables you to project leadership, assert authority in meetings, and ensure your ideas are not just heard, but respected.",
    },
    {
      imageSrc: "/p3.png",
      overlayText: "Your Voice Matters",
      category: "Self Improvement",
      title: "The Real Difference Between Selection And Rejection",
      description:
        "In highly competitive arenas, technical credentials only get you in the door; the way you communicate determines if you stay there. Selection goes to those who command attention, tell compelling stories, and engage their audience with unwavering presence. Transforming your voice from a simple tool into a powerful asset is the single most critical factor in defining your personal brand and securing success.",
    },
  ];

  return (
    <section id="blog-section" className="relative overflow-hidden border-t border-black/5 dark:border-white/5 bg-[#F5F5F5] dark:bg-black py-32 px-6 transition-colors duration-300">
      {/* Luxury Background Glow Effects */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-sky-200/20 dark:bg-white/5 blur-[120px] transition-colors duration-300" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[250px] w-[250px] rounded-full bg-sky-200/20 dark:bg-white/5 blur-[100px] transition-colors duration-300" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Inside Revial
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold uppercase italic tracking-tight text-zinc-900 dark:text-white max-w-4xl leading-tight"
          >
            Master The <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400">Power Of Speaking</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mt-6 leading-relaxed"
          >
            Because opportunities are often won by the way you speak.
          </motion.p>
        </div>

        {/* Responsive Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
        >
          {blogs.map((blog, index) => (
            <BlogCard
              key={index}
              imageSrc={blog.imageSrc}
              overlayText={blog.overlayText}
              category={blog.category}
              title={blog.title}
              description={blog.description}
              index={index}
            />
          ))}
        </motion.div>


      </div>
    </section>
  );
}
