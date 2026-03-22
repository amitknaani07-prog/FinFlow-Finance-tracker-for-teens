"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Plus, CheckCircle2 } from "lucide-react";
import { awardPoints } from "@/lib/points";

const INCOME_CATEGORIES = [
  "Part-time job",
  "Freelance/gig",
  "Reselling (eBay/Depop)",
  "Content creation",
  "Gift",
  "Allowance",
  "Other"
];

export default function IncomePage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  
  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) fetchIncomes();
  }, [user]);

  const fetchIncomes = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("type", "income")
      .order("date", { ascending: false });

    if (data) {
      setIncomes(data);
      // Calculate monthly total roughly
      const currentMonth = new Date().getMonth();
      const total = data
        .filter(d => new Date(d.date).getMonth() === currentMonth)
        .reduce((sum, item) => sum + Number(item.amount), 0);
      setMonthlyTotal(total);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);

    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      type: "income",
      amount: Number(amount),
      category,
      note,
      date
    });

    if (!error) {
      setAmount("");
      setNote("");
      
      const res = await awardPoints(user?.id || "", 2);
      if (res.bonusAwarded) {
        setSuccessMsg(`Added! +2 Score. ${res.message}`);
      } else {
        setSuccessMsg("Successfully added! +2 Score");
      }
      
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchIncomes();
    } else {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Income</h1>
        <p className="text-textMuted text-sm mt-1">Track everything you earn.</p>
      </div>

      <div className="bg-accent/10 border border-accent/20 p-6 rounded-3xl flex justify-between items-center">
        <div>
          <p className="text-accent text-sm font-medium">This Month</p>
          <h2 className="text-3xl font-black text-white">{formatCurrency(monthlyTotal)}</h2>
        </div>
      </div>

      {/* Add Income Form */}
      <div className="bg-surface p-6 rounded-3xl border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">Add Income</h3>
        
        {successMsg && (
          <div className="mb-4 bg-accent/20 text-accent p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 bg-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAddIncome} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-textMuted mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-textMuted mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              placeholder="Sold old sneakers..." />
          </div>

          <button disabled={loading} type="submit" className="w-full relative flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4">
            <Plus className="w-5 h-5" />
            {loading ? "Adding..." : "Log Income"}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">History</h3>
        <div className="space-y-3">
          {incomes.map(inc => (
            <div key={inc.id} className="flex justify-between items-center bg-surface/50 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-medium text-sm">{inc.category}</p>
                <div className="flex items-center gap-2 text-textMuted text-xs mt-1">
                  <span>{new Date(inc.date).toLocaleDateString()}</span>
                  {inc.note && <span>• {inc.note}</span>}
                </div>
              </div>
              <div className="font-bold text-accent">+{formatCurrency(inc.amount)}</div>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-center text-textMuted text-sm py-8">No income logs yet.</p>}
        </div>
      </div>
    </div>
  );
}
