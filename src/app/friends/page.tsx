"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { FriendRequestItem } from "@/components/FriendRequestItem";
import { User, MessageSquare, ArrowLeft, Users, Clock } from "lucide-react";
import { getOrCreateChat } from "@/lib/social";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to friends list from user doc
    const unsubUser = onSnapshot(doc(db, "users", user.uid), async (snapshot) => {
      if (snapshot.exists()) {
        const friendIds = snapshot.data().friends || [];
        const friendsData = await Promise.all(
          friendIds.map(async (id: string) => {
            const d = await getDoc(doc(db, "users", id));
            return { uid: id, ...d.data() };
          })
        );
        setFriends(friendsData);
      }
      setLoading(false);
    });

    // Listen to incoming friend requests
    const q = query(
      collection(db, "friendRequests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );
    
    const unsubRequests = onSnapshot(q, async (snapshot) => {
      const requestsData = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          const senderDoc = await getDoc(doc(db, "users", data.senderId));
          return {
            id: d.id,
            ...data,
            senderName: senderDoc.data()?.name,
            senderAvatar: senderDoc.data()?.avatar
          };
        })
      );
      setPendingRequests(requestsData);
    });

    return () => {
      unsubUser();
      unsubRequests();
    };
  }, [user]);

  const handleStartChat = async (friendId: string) => {
    if (!user) return;
    try {
      const chatId = await getOrCreateChat(user.uid, friendId);
      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start chat");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all active:scale-95 shrink-0 shadow-sm"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ThemeToggle />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Connections</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-foreground italic leading-none">FRIENDS</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Requests Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Requests ({pendingRequests.length})</h3>
            </div>
            
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(req => (
                  <FriendRequestItem key={req.id} request={req} onUpdate={() => {}} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic opacity-60">No pending requests</p>
              )}
            </div>
          </div>

          {/* Friends List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">All Friends ({friends.length})</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.uid} className="group flex items-center justify-between p-6 rounded-[2rem] bg-card/60 border border-white/5 hover:border-primary/30 transition-all shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-white/10">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-white/20" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black italic tracking-tight">{friend.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{friend.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartChat(friend.uid)}
                      className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                  <Users className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-muted-foreground font-medium italic">Your circle is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
