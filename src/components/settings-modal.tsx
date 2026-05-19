"use client";

import { X, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSave: (newName: string) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, userName, onSave }: SettingsModalProps) {
  const [newName, setNewName] = useState(userName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewName(userName);
  }, [userName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden group">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tight uppercase text-foreground">Settings</h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Display Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                  placeholder="Your Name"
                />
              </div>
            </div>


          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={async () => {
                setIsSaving(true);
                await onSave(newName);
                setIsSaving(false);
                onClose();
              }}
              disabled={isSaving}
              className="w-full py-4 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-full bg-transparent border border-border text-foreground font-black text-xs uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors z-20"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
