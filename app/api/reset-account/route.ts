import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate Limiting: 5 requests per minute (safety limit)
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Get user from auth header (set by middleware/supabase client)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 1. Reset User Profile Stats
    const { error: userError } = await supabase
      .from('users')
      .update({
        money_score: 0,
        streak: 0,
        last_log_date: null,
        // income_sources: [], // Optionally clear this? Let's keep it for convenience.
      })
      .eq('id', userId);

    if (userError) throw userError;

    // 2. Delete Transactions
    const { error: transError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);
      
    if (transError) throw transError;

    // 3. Delete Goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // 4. Delete Lesson Progress
    const { error: lessonError } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId);

    if (lessonError) throw lessonError;

    // 5. Delete Notifications
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (notifError) throw notifError;

    return NextResponse.json({ success: true, message: 'Account reset successfully' });
  } catch (error) {
    console.error('Error resetting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}