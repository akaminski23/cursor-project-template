import { NextResponse } from 'next/server';
import { validateTutorRequest } from '../../../src/lib/tutor/validate';
import type { TutorResponse, TutorUsage } from '../../../src/lib/tutor/types';

// Simple in-memory stats (resets on restart)
let stats = {
  totalRequests: 0,
  startTime: Date.now(),
  lastRequest: undefined as string | undefined
};

export async function GET() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const usage: TutorUsage = {
    totalRequests: stats.totalRequests,
    uptime: `${uptime}s`,
    lastRequest: stats.lastRequest
  };
  return NextResponse.json(usage);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const validation = validateTutorRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { message, code, action } = validation.data!;

  // Update stats
  stats.totalRequests++;
  stats.lastRequest = new Date().toISOString();

  // Generate mock response based on action
  const response: TutorResponse = {
    reply: generateMockReply(message, code, action),
    steps: generateMockSteps(action || 'chat'),
    question: generateMockQuestion(action || 'chat'),
    received: {
      hasCode: !!code,
      len: message.length
    }
  };

  return NextResponse.json(response);
}

function generateMockReply(message: string, code?: string, action = 'chat'): string {
  const codeInfo = code ? ` I see you've included ${code.length} characters of code.` : '';

  switch (action) {
    case 'run':
      return `Mock execution result for your code.${codeInfo} This would typically compile and run your code, showing output or errors.`;
    case 'explain':
      return `Mock explanation: This code appears to be ${guessLanguage(code)}.${codeInfo} I would analyze the structure, purpose, and provide detailed explanations.`;
    default:
      return `Mock response from AI Tudor: I understand your message "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}".${codeInfo} How can I help you learn today?`;
  }
}

function generateMockSteps(action: string): string[] {
  switch (action) {
    case 'run':
      return ['Parse code syntax', 'Check for errors', 'Execute in sandbox', 'Return output'];
    case 'explain':
      return ['Analyze code structure', 'Identify patterns', 'Explain concepts', 'Suggest improvements'];
    default:
      return ['Understand your question', 'Provide helpful guidance', 'Encourage learning'];
  }
}

function generateMockQuestion(action: string): string {
  switch (action) {
    case 'run':
      return 'What would you expect this code to output?';
    case 'explain':
      return 'Which part of this code would you like me to explain in more detail?';
    default:
      return 'What specific aspect would you like to explore further?';
  }
}

function guessLanguage(code?: string): string {
  if (!code) return 'a programming concept';
  if (code.includes('function') || code.includes('const') || code.includes('=>')) return 'JavaScript/TypeScript';
  if (code.includes('def ') || code.includes('import ')) return 'Python';
  if (code.includes('public class') || code.includes('System.out')) return 'Java';
  return 'a programming language';
}