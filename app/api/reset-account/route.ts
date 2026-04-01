import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          set(name: string, value: string, options: CookieOptions) {},
          remove(name: string, options: CookieOptions) {},
        },
      }
    );

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Reset User Profile Stats
    const { error: userError2 } = await supabase
      .from('users')
      .update({
        money_score: 0,
        streak: 0,
        last_log_date: null,
      })
      .eq('id', userId);

    if (userError2) throw userError2;

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