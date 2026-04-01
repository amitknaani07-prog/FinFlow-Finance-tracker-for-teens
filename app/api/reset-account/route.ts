import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate Limiting: 5 requests per minute (safety limit)
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Create a server client to read cookies from the request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get('Cookie');
            if (!cookieHeader) return [];
            return cookieHeader.split(';').map(c => {
              const [key, ...v] = c.trim().split('=');
              return { name: key, value: v.join('=') };
            });
          },
          set(name: string, value: string, options: CookieOptions) {
             // Not needed for POST requests here
          },
          remove(name: string, options: CookieOptions) {
             // Not needed for POST requests here
          },
        },
      }
    );

    // Refresh session to ensure it's loaded
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log("Session check:", session ? "Active" : "None", sessionError);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      console.log('Cookies received:', request.headers.get('Cookie'));
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