"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";


export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0A0C10] via-[#111318] to-[#1A1D24]">
      
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="flex justify-center">
          <BrandLogo size="xl" />
        </div>
        
        <p className="text-lg text-textMuted font-medium leading-relaxed">
          The money app built for teens, by a teen. Your money. Your rules. 
        </p>

        <div className="grid grid-cols-2 gap-4 text-left py-6">
          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-bold mb-1">Track Income</h3>
            <p className="text-textMuted text-xs">Side hustles, gifts, allowance.</p>
          </div>
          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-bold mb-1">Set Goals</h3>
            <p className="text-textMuted text-xs">Visually track your savings.</p>
          </div>
          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-bold mb-1">Learn</h3>
            <p className="text-textMuted text-xs">Bite-sized financial lessons.</p>
          </div>
          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-white font-bold mb-1">Gamified</h3>
            <p className="text-textMuted text-xs">Grow your Money Score.</p>
          </div>
        </div>

        <Link 
          href="/auth"
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-black font-bold py-4 rounded-2xl hover:bg-accentDark transition-all hover:scale-[1.02] shadow-xl shadow-accent/20"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
        
        <p className="text-xs text-textMuted">No bank account required. 100% free.</p>
        
      </div>

    </div>
  );
}
