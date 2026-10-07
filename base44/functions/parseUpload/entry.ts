const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { type, file_url } = body;
    if (!file_url || typeof file_url !== 'string') {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    if (type === 'transcript') {
      const res = await db.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            courses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  subject: { type: 'string', enum: ['Math', 'Science', 'English', 'Social Science', 'World Language', 'Arts', 'Computer Science', 'Other'] },
                  level: { type: 'string', enum: ['Standard', 'Honors', 'AP', 'IB', 'Dual Enrollment', 'College'] },
                  grade: { type: 'string' },
                  year: { type: 'string', enum: ['9', '10', '11', '12', 'College'] },
                  credits: { type: 'number' },
                },
                required: ['title'],
              },
            },
          },
          required: ['courses'],
        },
      });
      const output = res && res.output ? res.output : {};
      const courses = Array.isArray(output.courses) ? output.courses : [];
      return Response.json({ courses });
    }

    if (type === 'essay') {
      const res = await db.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            prompt: { type: 'string' },
            text: { type: 'string' },
          },
        },
      });
      const output = res && res.output ? res.output : {};
      return Response.json({
        title: output.title || '',
        prompt: output.prompt || '',
        text: output.text || '',
      });
    }

    return Response.json({ error: 'Invalid type; must be "transcript" or "essay"' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}