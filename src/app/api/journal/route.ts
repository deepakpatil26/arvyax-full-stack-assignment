import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/journal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ambience, text } = body;

    if (!userId || !ambience || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        ambience,
        text,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
