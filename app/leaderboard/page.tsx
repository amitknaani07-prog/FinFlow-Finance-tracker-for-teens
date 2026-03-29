"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Trophy, Medal, Star, Flame, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, name, money_score")
        .order("money_score", { ascending: false });

      if (data) setUsers(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 shadow-glow-green"
        />
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-accent/10 border border-accent/30 rounded-3xl flex items-center justify-center shadow-glow-green">
          <Trophy className="w-10 h-10 text-accent" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tighter">
            Global Ranked
          </h1>
          <p className="text-textMuted font-medium tracking-wide mt-2">Earn points by making responsible money moves.</p>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((u, index) => {
          const isCurrentUser = user && u.id === user.id;
          const rankColor = index === 0 ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                          : index === 1 ? "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]"
                          : index === 2 ? "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                          : "text-white/60";

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={u.id}
              className={`p-5 rounded-3xl flex items-center justify-between border backdrop-blur-xl transition-all duration-300
                ${isCurrentUser 
                  ? "bg-accent/10 border-accent/40 shadow-glow-green scale-[1.02]" 
                  : "bg-surfaceGlass border-white/5 hover:border-white/10"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl ${rankColor}`}>
                  {index === 0 ? <Flame className="w-8 h-8" /> : 
                   index === 1 ? <Medal className="w-7 h-7" /> : 
                   index === 2 ? <Star className="w-6 h-6" /> : 
                   `#${index + 1}`}
                </div>
                <div>
                  <h3 className={`font-bold text-lg tracking-wide ${isCurrentUser ? 'text-white' : 'text-white/80'}`}>
                    {u.name} {isCurrentUser && <span className="text-[10px] ml-2 font-black uppercase tracking-widest bg-accent text-background px-2 py-0.5 rounded-full">You</span>}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black tracking-tight text-2xl ${isCurrentUser ? 'text-accent' : 'text-white'}`}>{u.money_score}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Points</p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
