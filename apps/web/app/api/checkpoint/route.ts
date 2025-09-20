import { NextResponse } from 'next/server';
import { normalizeConceptInput } from '@/src/features/checkpoint/validation.js';
import { getPrismaClient } from '@/src/server/prismaClient.js';

export const DEMO_USER = {
  id: 'demo-user',
  email: 'learner@example.com',
  name: 'Demo Learner'
} as const;

export async function POST(request: Request) {
  const prisma = getPrismaClient();

  let concept: string;
  try {
    const body = await request.json();
    concept = normalizeConceptInput(body?.concept);
  } catch (error) {
    return NextResponse.json({ error: 'Concept is required.' }, { status: 400 });
  }

  try {
    await prisma.user.upsert({
      where: { id: DEMO_USER.id },
      update: {},
      create: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name
      }
    });

    const checkpoint = await prisma.checkpoint.create({
      data: {
        concept,
        userId: DEMO_USER.id
      }
    });

    return NextResponse.json({
      id: checkpoint.id,
      concept: checkpoint.concept,
      createdAt: checkpoint.createdAt.toISOString()
    });
  } catch (error) {
    console.error('[checkpoint] Failed to save checkpoint', error);
    return NextResponse.json({ error: 'Unable to save checkpoint.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const parsedLimit = Number.parseInt(limitParam ?? '5', 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 20) : 5;

  try {
    const checkpoints = await prisma.checkpoint.findMany({
      where: { userId: DEMO_USER.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(
      checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        concept: checkpoint.concept,
        createdAt: checkpoint.createdAt.toISOString()
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('[checkpoint] Failed to load checkpoints', error);
    return NextResponse.json({ error: 'Unable to load checkpoints.' }, { status: 500 });
  }
}
