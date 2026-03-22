import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { receipt_content } = await request.json();

    if (!receipt_content) {
      return NextResponse.json({ error: 'No receipt content provided' }, { status: 400 });
    }

    // Attempt to call Modal endpoint (if deployed and URL is known)
    // For now, if no URL is present or it fails, we fall back to a mock response
    const MODAL_URL = process.env.MODAL_AI_SCANNER_URL; // Update this after deploying Modal
    
    if (MODAL_URL) {
      const response = await fetch(MODAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_content })
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Fallback Mock Logic
    const categories = ['Food & Dining', 'Shopping', 'Entertainment', 'Transportation', 'Utilities'];
    const mockAmount = Math.round((Math.random() * 145 + 5) * 100) / 100;
    const mockCategory = categories[Math.floor(Math.random() * categories.length)];

    return NextResponse.json({
      status: 'success',
      data: {
        type: 'expense',
        amount: mockAmount,
        category: mockCategory,
        note: 'Mocked fallback from Next.js'
      }
    });
  } catch (error) {
    console.error('Error scanning receipt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
