import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate Limiting: 5 requests per minute on auth callback to prevent brute force
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page if something goes wrong
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_error`);
}