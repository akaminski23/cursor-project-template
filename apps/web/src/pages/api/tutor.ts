import type { NextApiRequest, NextApiResponse } from 'next';
import type { TutorRequestBody, TutorResponseBody, TutorUsageResponse } from '@/lib/tutor/types';
import { getTutorConfig } from '@/lib/tutor/config';
import { validateTutorRequest } from '@/lib/tutor/validate';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TutorResponseBody | TutorUsageResponse | { error: string }>
) {
  if (req.method === 'GET') {
    const config = getTutorConfig();
    const usage: TutorUsageResponse = {
      description: `Send a POST request with a message (and optional code) to receive tutoring guidance. Currently configured model: ${config.model}.`,
      method: 'POST',
      body: {
        message: 'string (1-2000 chars)',
        code: 'string optional'
      }
    };

    res.setHeader('X-AI-Tudor-Mode', config.isMock ? 'mock' : 'live');
    res.status(200).json(usage);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body: TutorRequestBody;
  try {
    body = validateTutorRequest(req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body.';
    res.status(400).json({ error: message });
    return;
  }

  const response: TutorResponseBody = {
    reply: 'Mock response from AI Tudor',
    steps: [
      'Review the problem in smaller chunks before coding.',
      'Run a quick experiment to validate your next change.'
    ],
    question: 'What is the next incremental step you can take to test your idea?',
    received: {
      message: body.message,
      hasCode: Boolean(body.code)
    }
  };

  const config = getTutorConfig();
  res.setHeader('X-AI-Tudor-Mode', config.isMock ? 'mock' : 'live');
  res.status(200).json(response);
}
