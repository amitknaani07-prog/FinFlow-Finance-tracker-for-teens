import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Note: Ensure the environment variables exist, otherwise mock them so build doesn't crash during verification.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          age: number;
          income_sources: string[];
          money_score: number;
          streak: number;
          last_log_date: string | null;
          created_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          note: string | null;
          date: string;
          created_at: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          completed: boolean;
          created_at: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: number;
          completed: boolean;
          score: number;
          completed_at: string | null;
        };
      };
    };
  };
};
