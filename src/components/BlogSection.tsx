"use client";

import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface BlogCardProps {
  imageSrc: string;
  overlayText: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  index: number;
}

const BlogCard = ({
  imageSrc,
  overlayText,
  category,
  title,
  description,
  readTime,
  index,
}: BlogCardProps) => {
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
      className="group relative flex flex-col justify-between h-full overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-950/40 p-6 shadow-2xl backdrop-blur-xl"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="object-cover"
            priority={index === 0}
            unoptimized
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

          {/* Minimalist White Overlay Text */}
          <div className="absolute bottom-4 left-4 z-20">
            <span className="inline-block rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md">
              {overlayText}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            {/* Category */}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {category}
            </span>

            {/* Read Time */}
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{readTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-extrabold uppercase italic leading-tight tracking-tight text-white md:text-2xl">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-zinc-400 font-medium">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function BlogSection() {
  const blogs = [
    {
      imageSrc: "/s1.webp",
      overlayText: "Speak With Confidence",
      category: "Speaking Skills",
      title: "Why Great Talent Still Fails Interviews",
      description:
        "Many people lose opportunities not because they lack skills, but because they struggle to speak confidently.",
      readTime: "4 min read",
    },
    {
      imageSrc: "/s2.webp",
      overlayText: "Communication Is Power",
      category: "Career Growth",
      title: "How Poor Speaking Skills Hold People Back",
      description:
        "Fear, hesitation, and weak communication can make even talented candidates look unprepared.",
      readTime: "5 min read",
    },
    {
      imageSrc: "/s3.webp",
      overlayText: "Your Voice Matters",
      category: "Self Improvement",
      title: "The Real Difference Between Selection And Rejection",
      description:
        "The way you speak, present yourself, and communicate often matters more than technical knowledge.",
      readTime: "6 min read",
    },
  ];

  return (
    <section id="blog-section" className="relative overflow-hidden border-t border-white/5 bg-black py-32 px-6">
      {/* Luxury Background Glow Effects */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[250px] w-[250px] rounded-full bg-white/5 blur-[100px]" />

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
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
              Inside Revial
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold uppercase italic tracking-tight text-white max-w-4xl leading-tight"
          >
            Master The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Power Of Speaking</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mt-6 leading-relaxed"
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
              readTime={blog.readTime}
              index={index}
            />
          ))}
        </motion.div>


      </div>
    </section>
  );
}
