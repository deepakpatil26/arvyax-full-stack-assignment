import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/journal/[userId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analysis: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
