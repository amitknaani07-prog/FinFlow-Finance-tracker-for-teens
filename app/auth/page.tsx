"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;
    let authData = null;

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
      authData = data;
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      authError = error;
      authData = data;
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (!isLogin && !authData?.session) {
      setError("Please check your email to verify your account.");
      setLoading(false);
    } else {
      router.push(isLogin ? "/dashboard" : "/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-xl border border-white/5">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-4">
             <BrandLogo size="lg" />
          </div>
          <p className="text-textMuted mt-2">Your money. Your rules.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && <div className="text-danger text-sm text-center bg-danger/10 p-3 rounded-lg">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white"
              placeholder="teen@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accentDark text-black font-semibold py-3 rounded-xl transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-textMuted hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
