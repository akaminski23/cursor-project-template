import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  buildExplainPrompt,
  createMockTutorResponse,
  formatTutorResponse,
  type TutorExplainRequestBody
} from '../../../../src/lib/core';

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5-turbo';

export async function POST(request: Request) {
  let body: TutorExplainRequestBody;

  try {
    body = (await request.json()) as TutorExplainRequestBody;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!body?.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  if (!openaiClient) {
    return NextResponse.json(createMockTutorResponse(body.prompt));
  }

  try {
    const prompt = buildExplainPrompt(body);
    const response = await openaiClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: body.prompt }
      ]
    });
    const outputText = response.choices[0]?.message?.content ?? JSON.stringify(response);
    const payload = formatTutorResponse(outputText);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[tutor:explain] Failed to call OpenAI', error);
    return NextResponse.json(createMockTutorResponse(body.prompt), { status: 200 });
  }
}
