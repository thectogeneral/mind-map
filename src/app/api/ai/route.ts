import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Thin proxy to the Anthropic Messages API. The key comes from the ANTHROPIC_API_KEY env var, or from an
 *  x-api-key header when a visitor brings their own key. Keys are never stored. */
export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY || req.headers.get('x-api-key') || '';
  if (!key) return NextResponse.json({ error: 'no_key' }, { status: 503 });
  let body: { prompt?: string; maxTokens?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }
  const prompt = String(body.prompt || '');
  if (!prompt) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (prompt.length > 60000) return NextResponse.json({ error: 'prompt_too_large' }, { status: 413 });
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: Math.min(Number(body.maxTokens) || 4000, 8000), messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) {
      const code = r.status === 401 ? 'bad_key' : r.status === 429 ? 'rate_limited' : r.status === 529 ? 'overloaded' : 'upstream';
      return NextResponse.json({ error: code }, { status: r.status === 401 ? 401 : r.status === 429 ? 429 : 502 });
    }
    const j = await r.json();
    const text = (j.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
    return NextResponse.json({ text, truncated: j.stop_reason === 'max_tokens' });
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
