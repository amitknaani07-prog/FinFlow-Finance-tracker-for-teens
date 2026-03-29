"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Trophy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Expanded lessons with rigorous questions and more material
const LESSONS = [
  {
    id: 1,
    title: "1. The Magic of Compound Interest",
    readTime: "4 min",
    content: "Compound interest is when you earn interest on both the money you've saved and the interest you earn. Think of it like a snowball rolling down a hill—as it picks up snow (interest), it gets bigger, and because it's bigger, it picks up even more snow! If you save $1,000 at 5% interest, year one you earn $50. Year two, you earn 5% on $1,050, which is $52.50. Over 30 years, that initial $1000 can quadruple without you adding another dime. Time is your best friend when it comes to investing.",
    quizzes: [
      { q: "What does compound interest apply to?", a: ["Only your original money", "Your original money AND interest earned", "Only the interest"], correct: 1 },
      { q: "What is the most important factor in compound interest?", a: ["Time", "The bank you use", "Checking it daily"], correct: 0 }
    ]
  },
  {
    id: 2,
    title: "2. The 50/30/20 Budgeting Rule",
    readTime: "5 min",
    content: "The 50/30/20 rule is a simple, effective budgeting method popularized by Elizabeth Warren. It breaks your after-tax income into three buckets: 50% for NEEDS (food, housing, basic transport). 30% for WANTS (gaming, dining out, hobbies). 20% for SAVINGS & INVESTING (emergency fund, investing). It keeps your life balanced without feeling overly restricted.",
    quizzes: [
      { q: "What percentage should go to Needs?", a: ["20%", "30%", "50%"], correct: 2 },
      { q: "Where does buying a new video game fall?", a: ["Needs", "Wants", "Savings"], correct: 1 },
      { q: "What percentage is dedicated to building your future wealth?", a: ["10%", "20%", "50%"], correct: 1 }
    ]
  },
  {
    id: 3,
    title: "3. Taxes and First Jobs",
    readTime: "4 min",
    content: "When you get your first job, you might be surprised that your $500 paycheck actually clears as $420. Where did it go? Taxes! The government collects taxes (like Federal Income Tax, Social Security, and Medicare) to pay for public infrastructure and safety nets. As a W-2 employee, this is withheld automatically. If you freelance, you might owe 'self-employment' tax if you earn over $400 a year.",
    quizzes: [
      { q: "At what freelance income do you typically need to report self-employment tax?", a: ["$0", "$400", "$10,000"], correct: 1 },
      { q: "What are Social Security and Medicare taxes often called together?", a: ["FICA", "W-2", "Sales Tax"], correct: 0 }
    ]
  },
  {
    id: 4,
    title: "4. Setting S.M.A.R.T. Goals",
    readTime: "3 min",
    content: "A good financial goal isn't just a wish; it's SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. Instead of saying 'I want to save money', say 'I will save $200 for a new phone by Christmas by putting away $20 a week'. This gives you a clear finish line and a daily system to reach it.",
    quizzes: [
      { q: "What does the 'T' in SMART stand for?", a: ["Time-bound", "Total", "Tax-free"], correct: 0 },
      { q: "Which of these is a SMART goal?", a: ["I want to be rich", "I will save $500 by July 1st for a car downpayment", "I will stop spending money"], correct: 1 }
    ]
  },
  {
    id: 5,
    title: "5. Credit Cards vs. Debit Cards",
    readTime: "6 min",
    content: "A Debit Card uses your own money directly from your checking account. When you swipe it, the cash is gone immediately. A Credit Card uses the bank's money—it's a short-term loan. If you don't pay it back completely at the end of the month, the bank charges you massive interest (often 20%+). However, using a credit card responsibly (paying it off in full every month) builds your 'Credit Score'.",
    quizzes: [
      { q: "What happens if you don't pay a credit card off in full?", a: ["Nothing", "You get charged high interest", "The bank deletes your account"], correct: 1 },
      { q: "Which card builds your Credit Score?", a: ["Debit Card", "Credit Card", "Gift Card"], correct: 1 }
    ]
  },
  {
    id: 6,
    title: "6. Emergency Funds",
    readTime: "4 min",
    content: "An Emergency Fund is a stash of money set aside to cover financial surprises. Without one, a broken laptop or a flat tire can spiral into credit card debt. Most experts recommend saving 3 to 6 months of living expenses. For a teen, having $500 to $1,000 in a separate high-yield savings account is a great safety net.",
    quizzes: [
      { q: "What is an Emergency Fund for?", a: ["Buying the latest iPhone", "Unexpected financial surprises like repairs", "Investing in stocks"], correct: 1 },
      { q: "How much do experts recommend adults save for emergencies?", a: ["1 month", "3-6 months", "1 year"], correct: 1 }
    ]
  }
];

export default function LearnPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [userScore, setUserScore] = useState(0);
  
  // Quiz state
  const [quizScores, setQuizScores] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user?.id)
      .eq("completed", true);

    if (data) {
      setCompletedLessons(data.map(d => d.lesson_id));
    }
    
    // Fetch user score
    const { data: userData } = await supabase.from("users").select("money_score").eq("id", user?.id).single();
    if (userData) setUserScore(userData.money_score);
  };

  const startLesson = (lesson: any) => {
    setActiveLesson(lesson);
    setQuizScores(new Array(lesson.quizzes.length).fill(-1));
    setQuizFinished(false);
  };

  const handleQuizSelect = (index: number, answerIndex: number) => {
    const newScores = [...quizScores];
    newScores[index] = answerIndex;
    setQuizScores(newScores);
  };

  const finishLesson = async () => {
    if (quizScores.includes(-1)) return; // Ensure all answered
    setSubmitting(true);

    let score = 0;
    activeLesson.quizzes.forEach((q: any, i: number) => {
      if (q.correct === quizScores[i]) score += 1;
    });

    const isComplete = !completedLessons.includes(activeLesson.id);

    // Update progress in Supabase
    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: user?.id,
      lesson_id: activeLesson.id,
      completed: true,
      score: score,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });

    if (!error && isComplete) {
      // Award points dynamically based on lesson size
      const pointsEarned = activeLesson.quizzes.length * 10;
      
      const { data: ud } = await supabase.from('users').select('money_score').eq('id', user?.id).single();
      if (ud) {
        await supabase.from('users').update({ money_score: ud.money_score + pointsEarned }).eq('id', user?.id);
      }
      
      setCompletedLessons(prev => [...prev, activeLesson.id]);
      setUserScore(prev => prev + pointsEarned);
    }

    setQuizFinished(true);
    setSubmitting(false);
  };

  if (activeLesson) {
    if (quizFinished) {
      return (
        <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen text-center space-y-6">
          <div className="w-24 h-24 bg-accent/20 text-accent rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-white">Lesson Completed!</h2>
          <p className="text-textMuted">+{activeLesson.quizzes.length * 10} Money Score points awarded.</p>
          <button 
            onClick={() => setActiveLesson(null)} 
            className="bg-white text-black font-bold py-3 px-8 rounded-xl mt-4"
          >
            Back to Library
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-6 pb-24">
        <button
          onClick={() => setActiveLesson(null)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>
        
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">{activeLesson.title}</h1>
          <p className="text-accent text-sm font-medium mt-2">{activeLesson.readTime} read</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-white/5 text-gray-300 leading-relaxed text-lg">
          {activeLesson.content}
        </div>

        <div className="pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Check</h3>
          {activeLesson.quizzes.map((quiz: any, i: number) => (
            <div key={i} className="bg-surface border border-white/5 p-5 rounded-2xl mb-4">
              <p className="text-white font-medium mb-4">{quiz.q}</p>
              <div className="space-y-2">
                {quiz.a.map((ans: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleQuizSelect(i, index)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                      quizScores[i] === index 
                        ? (index === quiz.correct ? 'bg-green-500/20 border-green-500 text-green-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 border-red-500 text-red-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]') 
                        : 'bg-[#0A0C10] border-white/5 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            disabled={quizScores.includes(-1) || submitting}
            onClick={finishLesson}
            className="w-full bg-accent text-black font-bold py-4 rounded-xl disabled:opacity-50 mt-4"
          >
            {submitting ? "Submitting..." : "Complete Lesson"}
          </button>
        </div>
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

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Learn</h1>
          <p className="text-textMuted text-sm mt-1">Level up your financial IQ to earn points.</p>
        </div>
        <div className="bg-surfaceGlass border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
           <Trophy className="w-4 h-4 text-accent" />
           <span className="text-white font-bold">{userScore} pts</span>
        </div>
      </div>

      <div className="space-y-4">
        {LESSONS.map((lesson) => {
          const isComplete = completedLessons.includes(lesson.id);
          
          return (
            <div 
              key={lesson.id} 
              onClick={() => startLesson(lesson)}
              className="bg-surface p-5 rounded-3xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isComplete ? 'bg-accent/20 text-accent' : 'bg-purpleAccent/20 text-purpleAccent'}`}>
                  {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${isComplete ? 'text-textMuted line-through' : 'text-white group-hover:text-accent transition-colors'}`}>
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-textMuted mt-1">{lesson.readTime} • +{lesson.quizzes.length * 10} pts</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isComplete ? 'text-textMuted' : 'text-white/30'}`} />
            </div>
          );
        })}
      </div>

    </div>
  );
}
