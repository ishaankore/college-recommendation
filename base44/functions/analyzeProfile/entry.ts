const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

function fmtCourses(courses) {
  if (!courses.length) return 'No courses entered yet.';
  return courses.map(c =>
    `- ${c.title} | ${c.level || 'Standard'} | ${c.subject || 'n/a'} | Grade: ${c.grade || 'n/a'} | Year ${c.year || 'n/a'}${c.credits ? ` | ${c.credits} credits` : ''}`
  ).join('\n');
}
function fmtTests(tests) {
  if (!tests.length) return 'No test scores entered yet.';
  return tests.map(t => `- ${t.test_type}${t.subject ? ` (${t.subject})` : ''}: ${t.score}${t.date_taken ? ` | ${t.date_taken}` : ''}`).join('\n');
}
function fmtActivities(a) {
  if (!a.length) return 'No activities entered yet.';
  return a.map(x =>
    `- ${x.name}${x.role ? ` — ${x.role}` : ''}${x.leadership ? ' (leadership)' : ''} | Grades ${x.grade_levels || 'n/a'} | ${x.hours_per_week || '?'} hrs/wk, ${x.weeks_per_year || '?'} wks/yr${x.description ? ` | ${x.description}` : ''}`
  ).join('\n');
}
function fmtAwards(a) {
  if (!a.length) return 'No awards entered yet.';
  return a.map(x => `- ${x.name} | ${x.level || 'School'}${x.date_received ? ` | ${x.date_received}` : ''}${x.description ? ` | ${x.description}` : ''}`).join('\n');
}
function fmtEssays(e) {
  if (!e.length) return 'No essays entered yet.';
  return e.map(x => `- "${x.title}" [${x.status || 'Draft'}]${x.prompt ? `\n  Prompt: ${x.prompt}` : ''}${x.text ? `\n  Essay: ${x.text.slice(0, 1200)}` : '\n  (no text written yet)'}`).join('\n');
}
function fmtInterests(i) {
  if (!i.length) return 'No interests entered yet.';
  return i.map(x => `- ${x.name}${x.description ? ` — ${x.description}` : ''}`).join('\n');
}
function fmtColleges(c) {
  if (!c.length) return 'No target colleges yet.';
  return c.map(x => `- ${x.name}${x.notes ? ` | ${x.notes}` : ''}${x.deadline ? ` | deadline ${x.deadline}` : ''}`).join('\n');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [courses, testScores, activities, awards, essays, interests, colleges] = await Promise.all([
      db.entities.Course.list(),
      db.entities.TestScore.list(),
      db.entities.Activity.list(),
      db.entities.Award.list(),
      db.entities.Essay.list(),
      db.entities.Interest.list(),
      db.entities.College.list(),
    ]);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const profileText = [
      '=== TRANSCRIPT / COURSES ===',
      fmtCourses(courses),
      '=== TEST SCORES ===',
      fmtTests(testScores),
      '=== ACTIVITIES ===',
      fmtActivities(activities),
      '=== AWARDS ===',
      fmtAwards(awards),
      '=== ESSAYS ===',
      fmtEssays(essays),
      '=== INTERESTS ===',
      fmtInterests(interests),
      '=== TARGET COLLEGES ===',
      fmtColleges(colleges),
    ].join('\n');

    const prompt = `You are an expert, realistic US college admissions counselor. A high school student wants honest, actionable guidance on improving their college options this month.

STUDENT PROFILE
${profileText}

Today's date: ${today}. Reason about where this student likely is in the application timeline based on their grade level and profile completeness.

Return a JSON object with these fields:
1. "standing_tier" — an honest overall read of which tier of colleges this profile is currently competitive for. One of: "Safety tier", "Likely tier", "Reach tier", "High reach tier", or "Not enough info" (only if the profile is too sparse to judge).
2. "standing_summary" — 2-4 honest sentences explaining the read.
3. "priorities" — 3 to 6 ranked, specific, actionable priorities for THIS month to improve their college options. Each has: priority (rank number, 1 = most important), title (short), detail (1-2 sentences, concrete and tied to their actual grades/activities/essays), category (one of: "Academics", "Testing", "Activities", "Essays", "Recommendations", "College research", "Other").
4. "dont_bother" — 1 to 3 things that would NOT meaningfully help their odds (e.g. joining another superficial club). Each has title and reason.
5. "completeness_percent" — integer 0-100, how complete/strong the profile is for competitive applications.
6. "missing_items" — short list of what's missing or weak.
7. "college_ratings" — for EACH target college listed, rate it "Safety", "Likely", "Reach", or "High Reach" based on this profile, with a 1-2 sentence rationale using real admissions data (acceptance rate, mid-50% test scores, GPA range). If a college can't be identified, rate "Not rated". Each has name (exactly as listed), status, rationale.

Be honest and specific. Do not flatter. Prioritize depth over breadth. Reference their real grades, activities, and essays by name.`;

    const llm = await db.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          standing_tier: { type: 'string', enum: ['Safety tier', 'Likely tier', 'Reach tier', 'High reach tier', 'Not enough info'] },
          standing_summary: { type: 'string' },
          priorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                priority: { type: 'integer' },
                title: { type: 'string' },
                detail: { type: 'string' },
                category: { type: 'string', enum: ['Academics', 'Testing', 'Activities', 'Essays', 'Recommendations', 'College research', 'Other'] },
              },
              required: ['priority', 'title', 'detail', 'category'],
            },
          },
          dont_bother: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, reason: { type: 'string' } },
              required: ['title', 'reason'],
            },
          },
          completeness_percent: { type: 'integer' },
          missing_items: { type: 'array', items: { type: 'string' } },
          college_ratings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                status: { type: 'string', enum: ['Safety', 'Likely', 'Reach', 'High Reach', 'Not rated'] },
                rationale: { type: 'string' },
              },
              required: ['name', 'status', 'rationale'],
            },
          },
        },
        required: ['standing_tier', 'standing_summary', 'priorities', 'completeness_percent'],
      },
    });

    const result = llm && typeof llm === 'object' && 'data' in llm && llm.data ? llm.data : llm;

    const assessment = await db.entities.Assessment.create({
      standing_tier: result.standing_tier || 'Not enough info',
      standing_summary: result.standing_summary || '',
      priorities: Array.isArray(result.priorities) ? result.priorities : [],
      dont_bother: Array.isArray(result.dont_bother) ? result.dont_bother : [],
      completeness_percent: typeof result.completeness_percent === 'number' ? result.completeness_percent : 0,
      missing_items: Array.isArray(result.missing_items) ? result.missing_items : [],
    });

    const ratings = Array.isArray(result.college_ratings) ? result.college_ratings : [];
    for (const cr of ratings) {
      const match = colleges.find(c => (c.name || '').toLowerCase().trim() === (cr.name || '').toLowerCase().trim());
      if (match) {
        await db.entities.College.update(match.id, { status: cr.status, rationale: cr.rationale });
      }
    }

    return Response.json({ assessment, college_ratings: ratings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}