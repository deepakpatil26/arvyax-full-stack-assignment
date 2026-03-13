import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        analysis: true,
      },
    });

    if (entries.length === 0) {
      return NextResponse.json({
        totalEntries: 0,
        topEmotion: 'None',
        mostUsedAmbience: 'None',
        recentKeywords: [],
      });
    }

    // 1. Total Entries
    const totalEntries = entries.length;

    // 2. Top Emotion
    const emotions = entries
      .map((e) => e.analysis?.emotion)
      .filter(Boolean) as string[];

    const topEmotion =
      emotions.length > 0
        ? emotions
            .sort(
              (a, b) =>
                emotions.filter((v) => v === a).length -
                emotions.filter((v) => v === b).length,
            )
            .pop()
        : 'None';

    // 3. Most Used Ambience
    const ambiences = entries.map((e) => e.ambience);
    const mostUsedAmbience = ambiences
      .sort(
        (a, b) =>
          ambiences.filter((v) => v === a).length -
          ambiences.filter((v) => v === b).length,
      )
      .pop();

    // 4. Recent Keywords
    const recentKeywords = entries
      .filter((e) => e.analysis)
      .slice(0, 5) // Last 5 entries
      .flatMap((e) => e.analysis!.keywords.split(','))
      .filter((v, i, a) => a.indexOf(v) === i) // Unique
      .slice(0, 8);

    return NextResponse.json({
      totalEntries,
      topEmotion,
      mostUsedAmbience,
      recentKeywords,
    });
  } catch (error) {
    console.error('Error calculating insights:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
