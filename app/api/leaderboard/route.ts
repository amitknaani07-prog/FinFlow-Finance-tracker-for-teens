import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch top 10 users by money_score
    const { data: leaderboard, error } = await supabase
      .from('users')
      .select('id, name, money_score, streak')
      .order('money_score', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
