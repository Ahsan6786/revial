import React, { useState, useMemo } from "react";
import { Book, Sparkles, ChevronRight, ChevronLeft, Hash, X, Globe, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DICTIONARY_DATA, DictionaryWord } from "@/lib/dictionary-data";
import { cn } from "@/lib/utils";

export function DailyDictionary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "All">("All");
  const [selectedWord, setSelectedWord] = useState<DictionaryWord | null>(null);

  const categories = ["All", "Daily", "Professional", "Emotional", "Social"];

  const filteredWords = useMemo(() => {
    return DICTIONARY_DATA.filter(w => {
      const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) || 
                            w.hinglish.toLowerCase().includes(search.toLowerCase()) ||
                            w.meaning.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || w.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const currentIndex = useMemo(() => {
    return filteredWords.findIndex(w => w.id === selectedWord?.id);
  }, [filteredWords, selectedWord]);

  const handleNextWord = () => {
    if (filteredWords.length <= 1) return;
    const nextIdx = (currentIndex + 1) % filteredWords.length;
    setSelectedWord(filteredWords[nextIdx]);
  };

  const handlePrevWord = () => {
    if (filteredWords.length <= 1) return;
    const prevIdx = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    setSelectedWord(filteredWords[prevIdx]);
  };

  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextWord();
    } else if (isRightSwipe) {
      handlePrevWord();
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Simple Header Section */}
      <div className="relative p-6 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[4rem] bg-card/40 border border-border/50 shadow-2xl overflow-hidden text-center flex flex-col items-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none opacity-30" />

        <div className="relative z-10 space-y-6 sm:space-y-8 w-full max-w-3xl">
          <div className="flex flex-col items-center gap-3 sm:gap-4">

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter italic leading-none uppercase">
              Dictionary
            </h1>
            <p className="text-muted-foreground/60 text-sm sm:text-lg md:text-xl font-medium italic tracking-tight">
              Master the words that command respect.
            </p>
          </div>


          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
                  selectedCategory === cat 
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" 
                    : "bg-background/50 text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredWords.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedWord(item)}
            className="group cursor-pointer rounded-[1.5rem] sm:rounded-[2.5rem] bg-card/40 border border-border/50 hover:border-primary/40 transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col relative overflow-hidden aspect-square items-center justify-center text-center p-4 sm:p-8"
          >
            {/* Category Indicator */}
            <div className={cn(
              "absolute top-4 left-4 sm:top-6 sm:left-6 w-1.5 h-1.5 rounded-full",
              item.category === "Professional" ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
              item.category === "Emotional" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
              item.category === "Social" ? "bg-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.5)]" : 
              "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            )} />

            <div className="relative z-10 space-y-2 sm:space-y-3 w-full px-2">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tighter group-hover:text-primary transition-colors italic leading-tight uppercase break-words hyphens-auto max-w-full">
                {item.word}
              </h3>
              <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] group-hover:text-primary/40 transition-colors truncate">
                {item.hinglish}
              </p>
            </div>

            {/* Hover Reveal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 hidden sm:block">
               <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary">View Meaning</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[3rem] bg-muted/50 border border-border flex items-center justify-center mb-6 sm:mb-8">
            <X className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/20" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-muted-foreground italic tracking-tight">No results for "{search}"</h2>
          <p className="text-muted-foreground/40 text-sm sm:text-lg mt-2 font-medium">Try broadening your search or choosing another category.</p>
        </div>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedWord && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8"
            onClick={() => setSelectedWord(null)}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-2xl" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-card border border-border rounded-[2rem] sm:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] select-none"
              onClick={e => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Premium Background Accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" />

              {/* Header area with Navigation and Close */}
              <div className="flex items-center justify-between p-6 sm:p-10 border-b border-border/40 z-20 bg-card/60 backdrop-blur-lg">
                {/* Navigation Triggers */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrevWord(); }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-all active:scale-90"
                    title="Previous Word"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    {currentIndex + 1} / {filteredWords.length}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNextWord(); }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-all active:scale-90"
                    title="Next Word"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 hover:scale-105 transition-all active:scale-90 group"
                >
                  <X className="w-5 h-5 text-foreground group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto scrollbar-hide custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedWord.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="p-6 sm:p-10 md:p-16 space-y-8 sm:space-y-12"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">{selectedWord.category} Usage</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 uppercase break-words hyphens-auto">
                          {selectedWord.word}
                        </h2>
                        
                        <div className="flex flex-row items-center gap-3 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 w-full sm:w-fit">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 flex-shrink-0">
                            <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-0.5">In Context (Hinglish)</p>
                            <span className="text-xl sm:text-3xl md:text-4xl font-black text-emerald-500 italic leading-none">{selectedWord.hinglish}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div className="space-y-4 sm:space-y-6 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] bg-muted/30 border border-border group hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                          <Book className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Formal Definition</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-bold leading-tight text-foreground/90 group-hover:text-foreground">
                          {selectedWord.meaning}
                        </p>
                      </div>

                      <div className="space-y-4 sm:space-y-6 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] bg-primary/5 border border-primary/10 group hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-3 text-primary">
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Social Command</span>
                        </div>
                        <p className="text-lg sm:text-2xl font-black italic text-primary group-hover:scale-[1.05] transition-transform origin-left leading-tight">
                          {selectedWord.usage}
                        </p>
                      </div>
                    </div>

                    <div className="relative group overflow-hidden rounded-[1.5rem] sm:rounded-[3.5rem]">
                      <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                      <div className="absolute top-0 right-0 w-64 h-64 bg-background/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                      <div className="relative z-10 p-8 sm:p-16 space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-4 text-background/30">
                          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Natural Application</span>
                        </div>
                        <p className="text-xl sm:text-3xl md:text-5xl font-black italic tracking-tighter leading-tight text-background">
                          "{selectedWord.example}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
