const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').trim();
    if (query.length < 2) return Response.json({ suggestions: [] });

    const prompt = `A student is building a list of target colleges for US college admissions. They typed: "${query}". Return up to 8 real, well-known US colleges and universities whose names match or relate to that query. Return ONLY a JSON object of the shape { "suggestions": ["Full Official College Name", ...] }. Use each school's official full name (e.g. "University of Michigan", "Massachusetts Institute of Technology", "University of California, Berkeley"). No commentary, no duplicates.`;

    // Direct call to OpenRouter (standard fetch) using the free Nemotron 3 Super 120B model.
    // The API key is read server-side from the OPENROUTER_API_KEY secret, so it never reaches the browser.
    const apiKey = secrets.get('OPENROUTER_API_KEY');
    if (!apiKey) return Response.json({ error: 'OPENROUTER_API_KEY secret is not set' }, { status: 500 });

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!orRes.ok) {
      const detail = await orRes.text().catch(() => '');
      return Response.json({ error: `OpenRouter error ${orRes.status}: ${detail.slice(0, 300)}` }, { status: 502 });
    }

    const orData = await orRes.json();
    const content = orData?.choices?.[0]?.message?.content || '';

    // Gemma may wrap JSON in prose or code fences — extract the first {...} block defensively.
    let suggestions: string[] = [];
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions
            .filter((s) => typeof s === 'string' && s.trim())
            .map((s) => s.trim())
            .slice(0, 8);
        }
      } catch { /* fall through to empty */ }
    }
    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}