"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { LogOut, Save, Moon, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.name);
        }
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    const { error } = await supabase.from("users").update({ name }).eq("id", user?.id);
    
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-textMuted text-sm mt-1">Manage your FinFlow account.</p>
      </div>

      <div className="bg-surface p-6 rounded-3xl border border-white/5 space-y-6">
        
        {/* Profile Card Summary */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent to-purpleAccent rounded-full flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-[#0A0C10] rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.name || "Loading..."}</h2>
            <p className="text-textMuted text-sm">{user?.email}</p>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Update Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profile</h3>
          {success && <div className="text-accent text-sm font-medium">Profile updated successfully.</div>}
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>
          <button disabled={loading} type="submit" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr className="border-white/5" />

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preferences</h3>
          
          <div className="flex justify-between items-center p-4 bg-[#0A0C10] rounded-2xl border border-white/5">
            <div className="flex gap-3 items-center">
              <Moon className="w-5 h-5 text-accent" />
              <div>
                <p className="text-white font-medium text-sm">Dark Mode</p>
                <p className="text-textMuted text-xs">FinFlow is dark by default.</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-accent rounded-full relative">
              <div className="w-4 h-4 bg-[#0A0C10] rounded-full absolute top-1 right-1 shadow-sm"></div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Danger Zone */}
        <div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 py-3 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

      </div>

    </div>
  );
}
