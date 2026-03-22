"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Minus, CheckCircle2 } from "lucide-react";
import { awardPoints } from "@/lib/points";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const EXPENSE_CATEGORIES = [
  "Food & drinks",
  "Clothes & fashion",
  "Games & apps",
  "Subscriptions",
  "Transport",
  "Education",
  "Social/going out",
  "Other"
];

const COLORS = ['#00E676', '#B388FF', '#FF3B30', '#FF9500', '#5AC8FA', '#FF2D55', '#5856D6', '#E5E5EA'];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("type", "expense")
      .order("date", { ascending: false });

    if (data) {
      setExpenses(data);
      
      // Calculate pie chart data
      const catTotals: Record<string, number> = {};
      data.forEach(d => {
        catTotals[d.category] = (catTotals[d.category] || 0) + Number(d.amount);
      });
      
      const pChart = Object.keys(catTotals).map(key => ({
        name: key,
        value: catTotals[key]
      })).sort((a,b) => b.value - a.value);

      setChartData(pChart);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);

    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      type: "expense",
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
      fetchExpenses();
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
        <h1 className="text-3xl font-bold text-white">Expenses</h1>
        <p className="text-textMuted text-sm mt-1">See where your money goes.</p>
      </div>

      {/* Pie Chart Analysis */}
      {chartData.length > 0 && (
        <div className="bg-surface p-6 rounded-3xl border border-white/5 h-64 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-textMuted w-full text-left mb-2">Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#1A1D24', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Expense Form */}
      <div className="bg-surface p-6 rounded-3xl border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">Add Expense</h3>
        
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

        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-danger"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-textMuted mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-danger" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-danger appearance-none">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-textMuted mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-danger"
              placeholder="Movie tickets..." />
          </div>

          <button disabled={loading} type="submit" className="w-full relative flex items-center justify-center gap-2 bg-danger/10 text-danger border border-danger/20 font-semibold py-3 rounded-xl hover:bg-danger/20 transition-colors disabled:opacity-50 mt-4">
            <Minus className="w-5 h-5" />
            {loading ? "Adding..." : "Log Expense"}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">History</h3>
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp.id} className="flex justify-between items-center bg-surface/50 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[EXPENSE_CATEGORIES.indexOf(exp.category) % COLORS.length] }}></span>
                  {exp.category}
                </p>
                <div className="flex items-center gap-2 text-textMuted text-xs mt-1 pl-4">
                  <span>{new Date(exp.date).toLocaleDateString()}</span>
                  {exp.note && <span>• {exp.note}</span>}
                </div>
              </div>
              <div className="font-bold text-white">-{formatCurrency(exp.amount)}</div>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-center text-textMuted text-sm py-8">No expense logs yet.</p>}
        </div>
      </div>
    </div>
  );
}
