"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ChevronRight, Sparkles, Mic, User, Target, Rocket } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  user: any;
  onComplete: (name: string) => void;
}

const QUESTIONS = [
  {
    question: "When you have to speak English, what happens most often?",
    options: [
      "My mind goes blank and I forget words.",
      "I translate from my native language in my head.",
      "I worry about grammar and making mistakes.",
      "I speak okay but sound robotic or flat."
    ]
  },
  {
    question: "Where do you want to use your new speaking power?",
    options: [
      "In meetings and professional presentations.",
      "In daily conversations and social life.",
      "In job interviews and career growth.",
      "Everywhere, I want to be unstoppable."
    ]
  },
  {
    question: "How much time can you invest daily to practice?",
    options: [
      "5-10 minutes (Quick sessions)",
      "15-30 minutes (Standard practice)",
      "30+ minutes (Deep immersion)"
    ]
  },
  {
    question: "What is your current comfort level with English?",
    options: [
      "I understand everything but fear speaking.",
      "I speak broken English with many pauses.",
      "I speak okay but lack that 'boss' energy."
    ]
  }
];

const STEPS = [
  {
    id: "welcome",
    title: "How you speak says a lot about you.",
    subtitle: "Are you ready to speak with more confidence?",
    icon: <Sparkles className="w-8 h-8" />,
    bgColor: "bg-[#0e87cc]",
    textColor: "text-white"
  },
  {
    id: "pain",
    title: "Do you ever feel nervous when speaking to others?",
    subtitle: "We're here to help you speak clearly and feel better.",
    icon: <Target className="w-8 h-8" />,
    bgColor: "bg-[#FF007F]",
    textColor: "text-white"
  },
  {
    id: "name",
    title: "Let's get started.",
    subtitle: "What is your name?",
    icon: <User className="w-8 h-8" />,
    bgColor: "bg-[#FF8C00]",
    textColor: "text-white",
    isInput: true
  },
  {
    id: "questions",
    title: "Help us customize your path.",
    subtitle: "Answer 4 quick questions to estimate your mastery timeline.",
    icon: <Target className="w-8 h-8" />,
    bgColor: "bg-black",
    textColor: "text-white",
    isQuestions: true
  },
  {
    id: "final",
    title: "Welcome, {name}.",
    subtitle: "Your journey to better speaking starts now. Let's go.",
    icon: <Rocket className="w-8 h-8" />,
    bgColor: "bg-[#228B22]",
    textColor: "text-white"
  }
];

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [estimatedDate, setEstimatedDate] = useState("");

  const step = STEPS[currentStep];
 
  const handleAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300); // Small delay for feel
    } else {
      // Last question answered, calculate date dynamically based on answers
      let daysToAdd = 60;

      // Q1: Condition
      const q1 = newAnswers[0];
      if (q1 === "My mind goes blank and I forget words.") daysToAdd += 15;
      else if (q1 === "I translate from my native language in my head.") daysToAdd += 10;
      else if (q1 === "I worry about grammar and making mistakes.") daysToAdd += 5;

      // Q3: Time investment
      const q3 = newAnswers[2];
      if (q3 === "5-10 minutes (Quick sessions)") daysToAdd += 15;
      else if (q3 === "30+ minutes (Deep immersion)") daysToAdd -= 15;

      // Q4: Comfort level
      const q4 = newAnswers[3];
      if (q4 === "I understand everything but fear speaking.") daysToAdd += 5;
      else if (q4 === "I speak broken English with many pauses.") daysToAdd += 15;
      else if (q4 === "I speak okay but lack that 'boss' energy.") daysToAdd -= 5;

      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      setEstimatedDate(date.toLocaleDateString('en-US', options));
      
      // Advance to hide questions and show date
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      if (step.id === "name" && !name.trim()) return;
      if (step.id === "questions" && (!estimatedDate || answers.length < QUESTIONS.length)) return;
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinishing(true);
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: name.trim(),
          onboarded: true,
          updatedAt: new Date().toISOString(),
          answers: answers,
          estimatedDate: estimatedDate
        }, { merge: true });
        onComplete(name);
      } catch (error) {
        console.error("Error saving onboarding:", error);
      }
    }
  };

  return (
    <div className={cn("fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-colors duration-1000", step.bgColor)}>
      <div className="relative w-full max-w-4xl px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center w-full"
          >
            {step.isQuestions ? (
              <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {currentQuestion < QUESTIONS.length ? (
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 40, scale: 0.99 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -40, scale: 0.99 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full flex flex-col items-center"
                    >
                      <span className="text-yellow-500 font-black text-xs uppercase tracking-[0.3em] mb-4">
                        Question {currentQuestion + 1} of {QUESTIONS.length}
                      </span>
                      
                      <h2 className="text-2xl md:text-4xl font-black text-white mb-10 italic max-w-3xl">
                        {QUESTIONS[currentQuestion].question}
                      </h2>

                      <div className="grid grid-cols-1 gap-4 w-full mb-12">
                        {QUESTIONS[currentQuestion].options.map((option, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            className={cn(
                              "w-full text-left p-5 rounded-2xl border transition-all text-lg font-bold outline-none",
                              answers[currentQuestion] === option
                                ? "bg-white text-black border-white shadow-[0_10px_35px_rgba(255,255,255,0.15)]"
                                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                            )}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center bg-gradient-to-br from-yellow-500/10 to-transparent p-8 rounded-[2.5rem] border border-yellow-500/20 w-full shadow-[0_0_50px_rgba(234,179,8,0.1)]"
                    >
                      <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-white text-lg font-medium mb-4">You are on track to speak with absolute command by:</h3>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 text-4xl font-black italic mb-6">{estimatedDate}</p>
                      <div className="flex justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isFinishing || !estimatedDate || answers.length < QUESTIONS.length}
                  className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-[2rem] font-black text-xl disabled:opacity-50 shadow-2xl shadow-black/10 mt-8"
                >
                  CONTINUE
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/20  text-white shadow-2xl mb-12 animate-pulse">
                  {step.icon}
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.1] max-w-3xl italic text-white">
                  {step.title.replace("{name}", name)}
                </h1>

                <p className="text-xl md:text-2xl text-white/80 font-medium mb-16 max-w-2xl leading-relaxed">
                  {step.subtitle}
                </p>

                {step.isInput && (
                  <div className="w-full max-w-md mb-16">
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      className="w-full bg-white/10 border-b-2 border-white/30 focus:border-white px-4 py-6 text-3xl font-bold text-center outline-none transition-all placeholder:text-white/30 text-white"
                    />
                  </div>
                )}

                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isFinishing || (step.id === "name" && !name.trim())}
                  className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-[2rem] font-black text-xl disabled:opacity-50 shadow-2xl shadow-black/10"
                >
                  {currentStep === STEPS.length - 1 ? "START NOW" : "NEXT"}
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {STEPS.map((_, i) => (
          <div 
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentStep ? "w-12 bg-white" : "w-3 bg-white/30"
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}
