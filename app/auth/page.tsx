"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import { Chrome } from "lucide-react";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    // Use the Real domain (no /callback) as per your Google Console settings
    const productionUrl = "https://finflow-finance-tracker.vercel.app";
    const devUrl = "http://localhost:3000";

    // Determine the correct redirect URL
    const isProduction = window.location.hostname.includes("vercel.app");
    const redirectUrl = isProduction 
      ? productionUrl
      : devUrl;

    console.log('Redirect URL being used:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('OAuth Error:', error);
      setError(error.message);
      setGoogleLoading(false);
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

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl transition-colors mb-6 disabled:opacity-50"
        >
          {googleLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <Chrome className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-surface text-textMuted">or continue with email</span>
          </div>
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
