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
      orderBy: { createdAt: 'desc' },
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
      .map((e: { analysis: { emotion: any } }) => e.analysis?.emotion)
      .filter((e: any): e is string => !!e);

    const emotionCounts = emotions.reduce(
      (acc: { [x: string]: any }, curr: string | number) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topEmotion =
      Object.entries(emotionCounts).length > 0
        ? Object.entries(emotionCounts).sort(
            (a: any, b: any) => b[1] - a[1],
          )[0][0]
        : 'None';

    // 3. Most Used Ambience
    const ambiences = entries.map((e: { ambience: any }) => e.ambience);
    const ambienceCounts = ambiences.reduce(
      (acc: { [x: string]: any }, curr: string | number) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostUsedAmbience =
      Object.entries(ambienceCounts).length > 0
        ? Object.entries(ambienceCounts).sort(
            (a: any, b: any) => b[1] - a[1],
          )[0][0]
        : 'None';

    // 4. Recent Keywords
    const recentKeywords = entries
      .filter(
        (e: { analysis: { keywords: any } }) =>
          e.analysis && e.analysis.keywords,
      )
      .slice(0, 5)
      .flatMap((e: { analysis: { keywords: any } }) =>
        e.analysis!.keywords.split(','),
      )
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
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
