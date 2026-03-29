import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch this month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString());

    if (txError) throw txError;

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('target_amount, current_amount')
      .eq('user_id', userId)
      .eq('completed', false);

    if (goalsError) throw goalsError;

    // Calculate remaining required for goals
    const remainingGoals = goals.reduce((sum, g) => sum + (g.target_amount - g.current_amount), 0);

    // Safe to spend Calculation
    const safeToSpend = Math.max(0, totalIncome - totalExpense - remainingGoals);

    return NextResponse.json({
      safe_to_spend: safeToSpend,
      total_income: totalIncome,
      total_expense: totalExpense,
      remaining_goals_target: remainingGoals
    });

  } catch (error) {
    console.error('Error calculating safe to spend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
